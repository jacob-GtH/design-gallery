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
      validation: (Rule: {required: () => any}) => Rule.required(),
    },

    // خاص بالصوره مع الخصائص المضافه اليها
    {
      name: 'media',
      title: 'Media Files',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'url',
              title: 'Media URL',
              type: 'url',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'type',
              title: 'Media Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Image', value: 'image'},
                  {title: 'Video', value: 'video'},
                ],
              },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
      validation: (Rule: any) => Rule.required(),
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
