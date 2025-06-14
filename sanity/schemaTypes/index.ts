// sanity/schemaTypes/index.ts
import { SchemaType} from 'sanity' 

import design from './design'
import designer from './designer'
import category from './category'
// import tag from './tag'
// import client from './client'
// import testimonial from './testimonial'


  export const schemaTypes = [
    design,
    designer,
    category,
    // tag,
    // client,
    // testimonial,
    {
      name: 'siteSettings',
      title: 'Site Settings',
      type: 'document',
      fields: [
        {
          name: 'title',
          title: 'Site Title',
          type: 'string',
          validation: (Rule: { required: () => any }) => Rule.required()
        },
        {
          name: 'description',
          title: 'Site Description',
          type: 'text',
          rows: 3
        },
        {
          name: 'logo',
          title: 'Site Logo',
          type: 'image',
          options: {
            hotspot: true
          }
        }
      ]
    }
  ]

