import argparse
import csv
import os
import re
import shutil
import sys
from datetime import datetime
from typing import Optional, Tuple


def extract_text_first_pages(pdf_path: str, max_pages: int = 3) -> str:
    """Extract text from the first N pages of a PDF using pdfplumber.

    Falls back gracefully if a page has no text or PDF is unreadable.
    """
    try:
        import pdfplumber  # Imported here so error messages are clearer
    except ModuleNotFoundError:
        print(
            "Erro: o pacote 'pdfplumber' não está instalado. "
            "Instale com: pip install -r requirements.txt",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        text_parts = []
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            for page_index in range(min(max_pages, total_pages)):
                page = pdf.pages[page_index]
                page_text = page.extract_text() or ""
                text_parts.append(page_text)
        return "\n".join(text_parts)
    except Exception as exc:  # noqa: BLE001
        # Many PDFs can be malformed; we skip those but report
        print(f"Aviso: falha ao ler '{pdf_path}': {exc}", file=sys.stderr)
        return ""


def find_year_in_text(
    text: str,
    label_regex: re.Pattern,
    fallback_year_regex: re.Pattern,
) -> Optional[str]:
    """Find a 4-digit year in the text prioritizing the 'Ano de exercício' label.

    Returns the year as a string (e.g., '2023') or None if not found.
    """
    if not text:
        return None

    label_match = label_regex.search(text)
    if label_match:
        return label_match.group(1)

    fallback_match = fallback_year_regex.search(text)
    if fallback_match:
        return fallback_match.group(0)

    return None


def ensure_unique_destination_path(destination_path: str) -> str:
    """If the destination file exists, append a numeric suffix to make it unique."""
    if not os.path.exists(destination_path):
        return destination_path

    base_dir = os.path.dirname(destination_path)
    base_name = os.path.basename(destination_path)
    name, ext = os.path.splitext(base_name)

    counter = 1
    while True:
        candidate = os.path.join(base_dir, f"{name} ({counter}){ext}")
        if not os.path.exists(candidate):
            return candidate
        counter += 1


def process_pdf(
    pdf_path: str,
    destination_root: str,
    label_regex: re.Pattern,
    fallback_year_regex: re.Pattern,
    move_files: bool,
    max_pages: int,
    dry_run: bool,
) -> Tuple[str, str, str]:
    """Process a single PDF: extract year, compute destination, move/copy.

    Returns a tuple: (source_path, year_or_tag, destination_path_or_reason)
    """
    extracted_text = extract_text_first_pages(pdf_path, max_pages=max_pages)
    year = find_year_in_text(extracted_text, label_regex, fallback_year_regex)
    year_folder = year if year is not None else "SEM_ANO"

    destination_dir = os.path.join(destination_root, year_folder)
    os.makedirs(destination_dir, exist_ok=True)

    destination_path = os.path.join(destination_dir, os.path.basename(pdf_path))
    destination_path = ensure_unique_destination_path(destination_path)

    if dry_run:
        action = "mover" if move_files else "copiar"
        return (pdf_path, year_folder, f"DRY-RUN: {action} -> {destination_path}")

    try:
        if move_files:
            shutil.move(pdf_path, destination_path)
        else:
            shutil.copy2(pdf_path, destination_path)
        return (pdf_path, year_folder, destination_path)
    except Exception as exc:  # noqa: BLE001
        return (pdf_path, year_folder, f"ERRO: {exc}")


def iter_pdf_files(source_root: str, recursive: bool) -> str:
    """Yield PDF file paths from a root directory."""
    if recursive:
        for dirpath, _dirnames, filenames in os.walk(source_root):
            for filename in filenames:
                if filename.lower().endswith(".pdf"):
                    yield os.path.join(dirpath, filename)
    else:
        for entry in os.scandir(source_root):
            if entry.is_file() and entry.name.lower().endswith(".pdf"):
                yield entry.path


def write_csv_log(log_rows, output_dir: str) -> Optional[str]:
    if not log_rows:
        return None
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = os.path.join(output_dir, f"log_organizacao_{ts}.csv")
    fieldnames = ["arquivo_origem", "ano", "destino_ou_motivo"]
    with open(log_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for src, year, dst in log_rows:
            writer.writerow(
                {
                    "arquivo_origem": src,
                    "ano": year,
                    "destino_ou_motivo": dst,
                }
            )
    return log_path


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Lê PDFs, detecta o 'Ano de exercício' e organiza os arquivos em pastas pelo ano."
        )
    )
    parser.add_argument(
        "--src",
        dest="source_dir",
        default=".",
        help="Diretório onde estão os PDFs (padrão: diretório atual)",
    )
    parser.add_argument(
        "--dst",
        dest="destination_dir",
        default="saida_por_ano",
        help="Diretório de saída onde serão criadas as pastas por ano (padrão: saida_por_ano)",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Se definido, busca PDFs recursivamente no diretório de origem",
    )
    parser.add_argument(
        "--copy",
        dest="copy",
        action="store_true",
        help="Se definido, copia os arquivos ao invés de mover",
    )
    parser.add_argument(
        "--max-pages",
        dest="max_pages",
        type=int,
        default=3,
        help="Número máximo de páginas lidas de cada PDF (padrão: 3)",
    )
    parser.add_argument(
        "--dry-run",
        dest="dry_run",
        action="store_true",
        help="Mostra o que seria feito sem mover/copiar os arquivos",
    )
    parser.add_argument(
        "--label-pattern",
        dest="label_pattern",
        default=r"(?i)Ano\s*de\s*exerc[ií]cio[^0-9]{0,40}(\b(19|20)\d{2}\b)",
        help=(
            "Regex para localizar o ano após o rótulo 'Ano de exercício'. "
            "Precisa ter um grupo de captura do ano. (padrão já funciona para a maioria)"
        ),
    )
    parser.add_argument(
        "--fallback-year-pattern",
        dest="fallback_year_pattern",
        default=r"\b(19|20)\d{2}\b",
        help=(
            "Regex de fallback para capturar um ano de 4 dígitos caso o rótulo não seja encontrado"
        ),
    )
    return parser


def main() -> None:
    parser = build_arg_parser()
    args = parser.parse_args()

    source_dir = os.path.abspath(args.source_dir)
    destination_dir = os.path.abspath(args.destination_dir)
    move_files = not args.copy
    dry_run = args.dry_run
    recursive = args.recursive
    max_pages = max(1, int(args.max_pages))

    try:
        label_regex = re.compile(args.label_pattern)
        fallback_year_regex = re.compile(args.fallback_year_pattern)
    except re.error as exc:  # noqa: BLE001
        print(f"Erro na expressão regular: {exc}", file=sys.stderr)
        sys.exit(2)

    if not os.path.isdir(source_dir):
        print(f"Erro: diretório de origem não existe: {source_dir}", file=sys.stderr)
        sys.exit(2)

    os.makedirs(destination_dir, exist_ok=True)

    total, moved, no_year, errors = 0, 0, 0, 0
    log_rows = []

    for pdf_file in iter_pdf_files(source_dir, recursive=recursive):
        total += 1
        src, year, dest_or_reason = process_pdf(
            pdf_file,
            destination_dir,
            label_regex,
            fallback_year_regex,
            move_files,
            max_pages,
            dry_run,
        )
        log_rows.append((src, year, dest_or_reason))

        if dest_or_reason.startswith("ERRO:"):
            errors += 1
            print(f"[ERRO] {src} -> {dest_or_reason}")
        else:
            if year == "SEM_ANO":
                no_year += 1
            else:
                moved += 1
            print(f"[OK]   {src} -> {dest_or_reason}")

    log_path = write_csv_log(log_rows, destination_dir)

    print("\nResumo:")
    print(f"  PDFs processados: {total}")
    print(f"  Com ano detectado: {moved}")
    print(f"  Sem ano detectado: {no_year}")
    print(f"  Com erro:          {errors}")
    if log_path:
        print(f"  Log salvo em:      {log_path}")


if __name__ == "__main__":
    main()



