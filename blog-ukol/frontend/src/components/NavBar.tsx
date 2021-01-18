import { 
    Box, 
    Button, 
    Flex, 
    Text, 
    Link,
    Avatar, 
    Popover, 
    PopoverArrow, 
    PopoverBody, 
    PopoverContent, 
    PopoverTrigger,
    Image, 
    PopoverHeader
} from '@chakra-ui/react';
import React from 'react';
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        pause: isServer(),
    });
    let body = null;

    if (fetching) {

    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2} className="blueAnchorHeader">Log In</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link className="blueAnchorHeader">Register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Flex align="center">
                <NextLink href="/myPosts">
                    <Link mr={6} onClick={async () => {
                        await router.push("/myPosts");
                        router.reload();
                    }}>My Articles</Link>
                </NextLink>
                <NextLink href="/create-post">
                    <Link mr={6} className="blueAnchorHeader">Create Article</Link>
                </NextLink>
                <Popover>
                    <PopoverTrigger>
                        <Avatar size="sm" name={data.me.firstname + " " + data.me.lastname} src={""} my="auto" />
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>Logged as {data.me.firstname + " " + data.me.lastname}</PopoverHeader>
                        <PopoverBody>
                            <Button 
                                onClick={async () => {
                                    await router.push("/");
                                    await logout();
                                    router.reload();
                                }} 
                                isLoading={logoutFetching}
                                variant="link"
                            >
                                Logout
                            </Button>  
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </Flex>
        )
    }

    return (
        <Flex zIndex={1} position="sticky" top={0} bg='#f8f9fa' p={4}>
            <Flex flex={1} m="auto" align="center" maxW="80%">
                <Image src="../../public/images/logo.png" alt="logo"/>
                <NextLink href="/">
                    <Link ml={6} onClick={async () => {
                        await router.push("/");
                        router.reload();
                    }}>
                        <Text>Recent Articles</Text>
                    </Link>
                </NextLink>
                <Text ml={6}>About</Text>
                <Box ml={'auto'}>{body}</Box>
            </Flex>
        </Flex>
    );
};

export default NavBar;