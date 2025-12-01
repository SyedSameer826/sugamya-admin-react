import { useState, useEffect } from "react";
import {
  EditorState,
  convertToRaw,
  ContentState,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const DescriptionEditor = ({ onChange, placeholder, value }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    const htmlContent = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
    if (onChange) {
      onChange(htmlContent);
    }
  };

  useEffect(() => {
    if (value) {
      const blocksFromHTML = htmlToDraft(value);
      if (blocksFromHTML) {
        const { contentBlocks, entityMap } = blocksFromHTML;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        setEditorState(EditorState.createWithContent(contentState));
      }
    }
  }, []);

  return (
    <Editor
      editorState={editorState}
      placeholder={placeholder}
      toolbarClassName="toolbarClassName"
      wrapperClassName="wrapperClassName"
      editorClassName="editorClassName"
      onEditorStateChange={handleEditorChange}
    />
  );
};

export default DescriptionEditor;
