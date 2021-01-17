import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Divider, Box, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { CommentSnippetFragment, useVoteMutation } from '../generated/graphql';


interface UpdootSectionProps {
    comment: CommentSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ comment }) => {
    const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');
    const [, vote] = useVoteMutation();
    return (
        <Flex 
            pr={5} 
            direction="row" 
            justifyContent="flex-start" 
            alignItems="center"
            >
            <Text>{comment.points}</Text>
            <Box ml={2} h="20px">
                <Divider orientation="vertical" />
            </Box>
            <IconButton
                onClick={async () => {
                    if (comment.voteStatus === 1) {
                        return;
                    }
                    setLoadingState('updoot-loading')
                    await vote({
                        commentId: comment.id,
                        value: 1,
                    });
                    setLoadingState('not-loading')
                }}
                colorScheme={comment.voteStatus === 1 ? "green" : undefined}
                isLoading={loadingState === "updoot-loading"}
                aria-label="updoot post" 
                icon={<ChevronUpIcon />} 
                size="18px"
                ml={2}
            />
            <Box ml={2} h="20px">
                <Divider orientation="vertical" />
            </Box>
            <IconButton
                onClick={async () => {
                    if (comment.voteStatus === -1) {
                        return;
                    }
                    setLoadingState('downdoot-loading')
                    await vote({
                        commentId: comment.id,
                        value: -1,
                    });
                    setLoadingState('not-loading')
                }}
                colorScheme={comment.voteStatus === -1 ? "red" : undefined}
                isLoading={loadingState === "downdoot-loading"}
                aria-label="downdoot post" 
                icon={<ChevronDownIcon />} 
                size="18px"
                ml={2}
            />
            <Box ml={2} h="20px">
                <Divider orientation="vertical" />
            </Box>
        </Flex>
    );
};

export default UpdootSection;