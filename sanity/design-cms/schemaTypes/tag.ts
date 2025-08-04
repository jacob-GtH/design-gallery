// ./sanity/schemaTypes/tag.ts
export default {
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
  ],
  validation: (Rule: {required: () => any}) => Rule.required(),
}
