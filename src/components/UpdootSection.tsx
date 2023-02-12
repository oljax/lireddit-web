import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../gql/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
        const [loadingState, setLoadingState] = useState<
            "updoot-loading" | "downdoot-loading" | "not-loading"
        >("not-loading");
        const [, vote] = useVoteMutation();
        return (
            <Flex 
                direction="column"
                justifyContent="center"
                alignItems="center"
                mr={4}
            >
                <IconButton
                    onClick={async () => {
                        if (post.voteStatus === 1 ) {
                            return;
                        }
                        setLoadingState("updoot-loading");
                        await vote({
                            postId: post.id,
                            value: 1,
                        });
                        setLoadingState("not-loading");                        
                    }} 
                    colorScheme={post.voteStatus === 1 ? "green" : undefined}
                    isLoading={loadingState === "updoot-loading"}
                    size="sm"
                    aria-label="updoot post"
                    icon={<ChevronUpIcon fontSize="24px" />}
                />                                
                    {post.points}
                <IconButton
                    onClick={async () => {
                        if (post.voteStatus === -1 ) {
                            return;
                        }
                        setLoadingState("downdoot-loading");
                        await vote({
                            postId: post.id,
                            value: -1,
                        });
                        setLoadingState("not-loading");
                    }}
                    colorScheme={post.voteStatus === -1 ? "red" : undefined}
                    isLoading={loadingState === "downdoot-loading"}
                    size="sm"
                    aria-label="downdoot post"
                    icon={<ChevronDownIcon fontSize="24px"/>}
                 />
            </Flex>
        );
}