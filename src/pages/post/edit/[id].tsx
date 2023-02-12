import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';

import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../gql/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';
import { useGetPostFromUrl } from '../../../utils/useGetPostFromUrl';



export const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{data,  fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        },
    });
    const [,updatePost] = useUpdatePostMutation();
    if(fetching) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        )
    }
    if(!data?.post) {
        return (
            <Layout>
                <Box>
                    could not find post
                </Box>
            </Layout>
        )
    }

        return (
            <Layout variant='small'>
                <Formik
                    initialValues={{title: data.post.title, text: data.post.text}}
                    onSubmit={async (values) => {                        
                        await updatePost({id: intId, ...values});
                        router.back();
                    }}
                >
                    {({isSubmitting}) => (
                        <Form>
                            <InputField
                                name='title'
                                placeholder='title'
                                label='Title'
                            />
                            <Box mt={4}>
                                <InputField
                                    height={20}
                                    name='text'
                                    placeholder='text...'
                                    label='Body'                                    
                                />
                            </Box>                            
                            <Button 
                                type='submit'
                                colorScheme='teal'
                                mt={2}                            
                                isLoading={isSubmitting}
                            >
                                update post
                            </Button>
                            
                        </Form>
                    )}
                </Formik>
            </Layout>
        );
}

export default withUrqlClient(createUrqlClient)(EditPost);