import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import { InputField } from '../components/InputField';

import { withUrqlClient } from 'next-urql';
import { useRouter } from "next/router";
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../gql/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';


const CreatePost: React.FC<{}> = ({}) => {        
        const router = useRouter();
        useIsAuth();
        const [,createPost] = useCreatePostMutation();
        return (
            <Layout variant='small'>
                <Formik
                    initialValues={{title: "", text: ""}}
                    onSubmit={async (values) => {
                        const { error } = await createPost({input: values});
                        if(!error) {
                            router.push("/");
                        }
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
                                create post
                            </Button>
                            
                        </Form>
                    )}
                </Formik>
            </Layout>
        );
}

export default withUrqlClient(createUrqlClient)(CreatePost);