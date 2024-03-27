import React, { useEffect, useState } from 'react'

import styles from './InlineTextEditor.module.css'

interface InlineTextEditorProps {
  children: string
  afterEdit?: (value: string) => void
  className?: string
  maxLength?: number
}

const InlineTextEditor = ({ children, afterEdit, className, maxLength }: InlineTextEditorProps) => {
  const [editing, setEditing] = useState<boolean>(false)
  const inputRef = React.createRef<HTMLTextAreaElement>()

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const textContainer = (
    <span
      className={styles.inlineText + ' ' + (className ? className : '')}
      onClick={() => {
        setEditing(true)
      }}
    >
      {children}
    </span>
  )

  const input = (
    <textarea
      className={styles.inlineTextInput}
      defaultValue={children}
      ref={inputRef}
      autoFocus={true}
      maxLength={maxLength}
      onBlur={(e) => {
        if (afterEdit) {
          afterEdit(e.target.value.replace(/(?:\r\n|\r|\n|[><;"{}=/\\])/g, '').trim())
        }
        setEditing(false)
      }}
    />
  )

  return (
    <>
      {!editing && textContainer}
      {editing && input}
    </>
  )
}

export default InlineTextEditor
