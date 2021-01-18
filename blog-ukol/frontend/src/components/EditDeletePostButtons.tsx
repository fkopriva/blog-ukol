import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Link } from '@chakra-ui/react';
import NextLink from "next/link";
import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
    id: number,
    creatorId: number,
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ id, creatorId }) => {
    const [{ data: meData }] = useMeQuery();
    const [, deletePost] = useDeletePostMutation();

    if (meData?.me?.id !== creatorId && !meData?.me?.isAdmin) {
        return null;
    }

    return (
        <Flex>
            <NextLink 
                href="/post/edit/[id]"
                as={`/post/edit/${id}`}
            >
                <IconButton
                    as={Link}
                    aria-label="Edit Post"
                    icon={<EditIcon />}
                />
            </NextLink>
            <IconButton 
                aria-label="Delete Post" 
                icon={<DeleteIcon />}
                onClick={() => {
                    deletePost({ id });
                }}
            />
        </Flex>
    );
};

export default EditDeletePostButtons;