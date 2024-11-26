import os
import sys
from fontTools.ttLib import TTFont

def convert_ttf_to_woff2(input_path, output_dir):
    # 出力フォルダが存在しない場合は作成
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 入力がファイルかディレクトリかを判別
    if os.path.isfile(input_path):  # 個別ファイル
        if input_path.endswith(".ttf"):
            output_path = os.path.join(output_dir, os.path.basename(input_path).replace(".ttf", ".woff2"))
            font = TTFont(input_path)
            font.flavor = "woff2"
            font.save(output_path)
            print(f"Converted {input_path} to {output_path}")
        else:
            print(f"Error: The file '{input_path}' is not a TTF file.")
    elif os.path.isdir(input_path):  # ディレクトリの場合
        for file in os.listdir(input_path):
            if file.endswith(".ttf"):
                input_file_path = os.path.join(input_path, file)
                output_path = os.path.join(output_dir, file.replace(".ttf", ".woff2"))
                font = TTFont(input_file_path)
                font.flavor = "woff2"
                font.save(output_path)
                print(f"Converted {input_file_path} to {output_path}")
    else:
        print(f"Error: The path '{input_path}' is neither a valid file nor a directory.")

def main():
    # コマンドライン引数の取得
    if len(sys.argv) < 3:
        print("Usage: python convert_fonts.py <input_path> <output_directory>")
        sys.exit(1)

    input_path = sys.argv[1]  # ファイルまたはディレクトリ
    output_directory = sys.argv[2]

    # 入力パスの存在確認
    if not os.path.exists(input_path):
        print(f"Error: Input path '{input_path}' does not exist.")
        sys.exit(1)

    # 変換処理を実行
    convert_ttf_to_woff2(input_path, output_directory)

if __name__ == "__main__":
    main()
