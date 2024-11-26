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

def convert_ttf_to_woff2(input_path, output_dir):
    # Create output folder if it does not exist
    try:
        os.makedirs(output_dir, exist_ok=True)
    except PermissionError:
        print(f"Error: Permission denied when creating directory '{output_dir}'")
        sys.exit(1)
    except OSError as e:
        print(f"Error creating directory '{output_dir}': {str(e)}")
        sys.exit(1)

    # Determine if input is a file or directory
    # - File
    if os.path.isfile(input_path):
        if input_path.endswith(".ttf"):
            output_path = os.path.join(output_dir, os.path.basename(input_path).replace(".ttf", ".woff2"))
            convert_single_file(input_path, output_path)
        else:
            print(f"Error: The file '{input_path}' is not a TTF file.")

    # - Directory
    elif os.path.isdir(input_path):
        for file in os.listdir(input_path):
            if file.endswith(".ttf"):
                input_file_path = os.path.join(input_path, file)
                output_path = os.path.join(output_dir, file.replace(".ttf", ".woff2"))
                convert_single_file(input_file_path, output_path)

    # - Other
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
