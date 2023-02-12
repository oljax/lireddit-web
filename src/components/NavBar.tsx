import React from 'react';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../gql/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from "next/router";


interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery();

    
    let body = null;

    if(fetching) {

    } else if (!data?.me) {
        body = (
            <>                
                <NextLink href="/login">
                    login
                </NextLink>
                <NextLink href="/register">
                    register
                </NextLink>                
            </>
        )
    } else {
        body = (
            <Flex align="center">                
                <NextLink href='/create-post' passHref>
                    <Button color="blackAlpha.700"  mr={4}>create post</Button>
                </NextLink>
                
                <Box mr={2}>{data.me.username}</Box>
                <Button 
                    onClick={async() => {
                        await logout();
                        router.reload();
                    }}
                    isLoading={logoutFetching}
                    variant="link" color="whiteAlpha.700"
                >logout</Button>
            </Flex>            
        );        
    }
        return (
            <Flex bg="tan" p={4} align="center">
                <Flex maxW={800} align="center" flex={1} m="auto">
                    <NextLink href="/">
                        <Heading>LiReddit</Heading>
                    </NextLink>
                    <Box ml={"auto"} >
                        <Flex gap={2}>
                            {body}
                        </Flex>
                    </Box>
                </Flex>
            </Flex>
        );
};