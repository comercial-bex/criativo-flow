import { BuilderComponent as BuilderReactComponent } from '@builder.io/react'
import { useEffect, useState } from 'react'
import { builder } from '@/lib/builder'

interface BuilderComponentProps {
  model: string
  content?: any
}

export function BuilderComponent({ model, content }: BuilderComponentProps) {
  const [builderContent, setBuilderContent] = useState(content)

  useEffect(() => {
    if (!content) {
      builder
        .get(model, { userAttributes: { url: window.location.pathname } })
        .promise()
        .then(setBuilderContent)
        .catch((err) => {
          console.error('Builder.io fetch error:', err)
        })
    }
  }, [model, content])

  return (
    <BuilderReactComponent 
      model={model} 
      content={builderContent}
    />
  )
}