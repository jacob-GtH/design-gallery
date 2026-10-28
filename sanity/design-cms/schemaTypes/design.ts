// sanity/schemaTypes/design.ts
export default {
  name: 'design',
  title: 'Design',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: {required: () => any}) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: {required: () => any}) => Rule.required(),
    },
    {
      name: 'designer',
      title: 'Designer',
      type: 'reference',
      to: [{type: 'designer'}],
      validation: (Rule: any) =>
        Rule.custom((value: unknown, ctx: any) =>
          ctx.document?.status === 'draft' || value ? true : 'Designer is required',
        ),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Drafts are hidden from the public site. Documents without a status are treated as published.',
      options: {
        list: [
          {title: 'Published', value: 'published'},
          {title: 'Draft', value: 'draft'},
        ],
        layout: 'radio',
      },
      initialValue: 'published',
    },
    {
      name: 'coverKey',
      title: 'Cover block key',
      type: 'string',
      description: 'The _key of the media block used as the card cover. Empty = first image/video.',
    },

    // كتل المحتوى: image / video / text / embed (YouTube, Vimeo) / grid
    // caption يحمل HTML منظَّفاً (وفي كتلة text هو المحتوى نفسه)
    {
      name: 'media',
      title: 'Content blocks',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'block',
          fields: [
            {
              name: 'type',
              title: 'Block Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Image', value: 'image'},
                  {title: 'Video', value: 'video'},
                  {title: 'Text', value: 'text'},
                  {title: 'Embed (YouTube / Vimeo)', value: 'embed'},
                  {title: 'Image grid', value: 'grid'},
                ],
              },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              hidden: ({parent}: any) => parent?.type === 'text' || parent?.type === 'grid',
              validation: (Rule: any) =>
                Rule.custom((value: unknown, ctx: any) => {
                  const type = ctx.parent?.type
                  return type === 'text' || type === 'grid' || value ? true : 'URL is required'
                }),
            },
            {
              name: 'caption',
              title: 'Caption / Text (HTML)',
              type: 'text',
            },
            {
              name: 'columns',
              title: 'Grid columns',
              type: 'number',
              hidden: ({parent}: any) => parent?.type !== 'grid',
              validation: (Rule: any) => Rule.min(1).max(4).integer(),
            },
            {
              name: 'items',
              title: 'Grid images',
              type: 'array',
              hidden: ({parent}: any) => parent?.type !== 'grid',
              of: [
                {
                  type: 'object',
                  fields: [{name: 'url', title: 'Image URL', type: 'url', validation: (Rule: any) => Rule.required()}],
                },
              ],
            },
          ],
        },
      ],
      validation: (Rule: any) =>
        Rule.custom((value: unknown, ctx: any) =>
          ctx.document?.status === 'draft' || (Array.isArray(value) && value.length > 0)
            ? true
            : 'At least one block is required',
        ),
    },

    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    },
    {
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'backgroundColor',
      title: 'backgroundColor',
      type: 'string',
      validation: (Rule: {required: () => any}) => Rule.required(),
    },

    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: new Date().toISOString(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      designer: 'designer.name',
      media: 'media',
    },
    prepare(value: any) {
      const designer = value?.designer
      return {
        title: value.title,
        subtitle: designer ? `by ${designer}` : '',
        media: Array.isArray(value.media) && value.media.length > 0 ? value.media[0] : undefined,
      }
    },
  },
}
