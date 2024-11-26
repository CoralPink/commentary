import os
import sys
from fontTools.ttLib import TTFont

def convert_single_file(input_file, output_file):
    try:
        font = TTFont(input_file)
        font.flavor = "woff2"
        font.save(output_file)
        print(f"Converted {input_file} to {output_file}")
    except Exception as e:
        print(f"Error converting {input_file}: {str(e)}")

from typing import Union
from pathlib import Path

def convert_ttf_to_woff2(input_path: Union[str, Path], output_dir: Union[str, Path]) -> None:
    """
    Convert TTF font files to WOFF2 format.

    Args:
        input_path: Path to TTF file or directory containing TTF files
        output_dir: Directory where WOFF2 files will be saved

    Raises:
        OSError: If directory creation fails
        ValueError: If input path is invalid
    """
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    try:
        output_dir.mkdir(parents=True, exist_ok=True)
    except PermissionError:
        print(f"Error: Permission denied when creating directory '{output_dir}'")
        sys.exit(1)
    except OSError as e:
        print(f"Error creating directory '{output_dir}': {str(e)}")
        sys.exit(1)

    if input_path.is_file():
        if input_path.suffix.lower() == '.ttf':
            output_path = output_dir / input_path.name.replace('.ttf', '.woff2')
            # Ensure output path is within output_dir
            if not output_path.resolve().is_relative_to(output_dir.resolve()):
                print(f"Error: Invalid output path '{output_path}'")
                sys.exit(1)
            convert_single_file(input_path, output_path)
        else:
            print(f"Error: The file '{input_path}' is not a TTF file.")

    elif input_path.is_dir():
        ttf_files = list(input_path.glob("*.ttf"))
        if not ttf_files:
            print(f"Warning: No TTF files found in '{input_path}'")
            return
        
        print(f"Found {len(ttf_files)} TTF files to convert...")
        for i, input_file_path in enumerate(ttf_files, 1):
            print(f"Converting file {i}/{len(ttf_files)}: {input_file_path.name}")
            output_path = output_dir / input_file_path.name.replace('.ttf', '.woff2')
            if not output_path.resolve().is_relative_to(output_dir.resolve()):
                print(f"Error: Invalid output path '{output_path}'")
                continue
                convert_single_file(input_file_path, output_path)
    else:
        print(f"Error: The path '{input_path}' is neither a valid file nor a directory.")

def main():
    if len(sys.argv) < 3:
        print("Usage: python convert_fonts.py <input_path> <output_directory>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_directory = sys.argv[2]

    if not os.path.exists(input_path):
        print(f"Error: Input path '{input_path}' does not exist.")
        sys.exit(1)

    convert_ttf_to_woff2(input_path, output_directory)

if __name__ == "__main__":
    main()
