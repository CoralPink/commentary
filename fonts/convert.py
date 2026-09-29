import argparse
from pathlib import Path

from fontTools.ttLib import TTFont


def convert_file(input_path: Path, output_dir: Path) -> None:
    output_path = output_dir / input_path.with_suffix(".woff2").name

    font = TTFont(input_path)
    font.flavor = "woff2"
    font.save(output_path)

    print(f"Converted {input_path} to {output_path}")


def convert_ttf_to_woff2(
    input_path: str | Path,
    output_dir: str | Path,
) -> None:
    """
    Convert TTF font files to WOFF2 format.

    Args:
        input_path: Path to a TTF file or a directory containing TTF files.
        output_dir: Directory where WOFF2 files will be saved.
    """
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    if input_path.is_file():
        if input_path.suffix.lower() != ".ttf":
            raise ValueError(f"Input file is not a TTF file: {input_path}")

        convert_file(input_path, output_dir)
        return

    if input_path.is_dir():
        ttf_files = sorted(input_path.glob("*.ttf"))

        if not ttf_files:
            print(f"Warning: No TTF files found in '{input_path}'")
            return

        print(f"Found {len(ttf_files)} TTF files to convert...")

        for index, ttf_file in enumerate(ttf_files, 1):
            print(f"Converting file {index}/{len(ttf_files)}: {ttf_file.name}")
            convert_file(ttf_file, output_dir)

        return

    raise ValueError(f"Input path is neither a file nor a directory: {input_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert TTF font files to WOFF2 format."
    )
    parser.add_argument("input_path", type=Path)
    parser.add_argument("output_directory", type=Path)
    args = parser.parse_args()

    convert_ttf_to_woff2(args.input_path, args.output_directory)


if __name__ == "__main__":
    main()
