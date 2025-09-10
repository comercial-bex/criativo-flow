import { BuilderComponent as BuilderReactComponent, builder } from '@builder.io/react'
import { useEffect, useState } from 'react'

interface BuilderComponentProps {
  model: string
  content?: any
}

export function BuilderComponent({ model, content }: BuilderComponentProps) {
  const [builderContent, setBuilderContent] = useState(content)

  useEffect(() => {
    if (!content) {
      builder.get(model).promise().then(setBuilderContent)
    }
  }, [model, content])

  return (
    <BuilderReactComponent 
      model={model} 
      content={builderContent}
    />
  )
}