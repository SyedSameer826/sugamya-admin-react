import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

function Editor({ value, onChange, placeholder }) {
  return (
    <div
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #d9d9d9",
      }}
    >
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          placeholder: placeholder,
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "subscript",
            "superscript",
            "|",
            "fontFamily",
            "fontSize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "alignment",
            "outdent",
            "indent",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "|",
            "blockQuote",
            "link",
            "insertTable",
            "mediaEmbed",
            "horizontalLine",
            "pageBreak",
            "code",
            "codeBlock",
            "|",
            "undo",
            "redo",
            "removeFormat",
          ],
          alignment: {
            options: ["left", "center", "right", "justify"],
          },
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}

export default Editor;
