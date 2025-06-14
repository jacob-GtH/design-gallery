// sanity/schemaTypes/designer.ts
export default {
    name: 'designer',
    title: 'Designer',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule: { required: () => any; }) => Rule.required()
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96
            },
            validation: (Rule: { required: () => any; }) => Rule.required()
        },
        {
            name: 'avatar',
            title: 'Avatar',
            type: 'image',
            options: {
                hotspot: true
            }
        },
        {
            name: 'bio',
            title: 'Bio',
            type: 'text',
            rows: 4
        },
        {
            name: 'socialLinks',
            title: 'Social Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'platform',
                            title: 'Platform',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Twitter', value: 'twitter' },
                                    { title: 'Instagram', value: 'instagram' },
                                    { title: 'Behance', value: 'behance' },
                                    { title: 'Dribbble', value: 'dribbble' }
                                ]
                            }
                        },
                        {
                            name: 'url',
                            title: 'URL',
                            type: 'url'
                        }
                    ]
                }
            ]
        }
    ]
}