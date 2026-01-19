"use client";

import { Avatar, Badge, Box, Circle, Flex, Grid, HStack, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { IconType } from "react-icons";
import Image from "next/image";

interface Project {
  id: number;
  title: string;
  description: string;
  link?: string;
  image?: string;
}

interface Member {
  id: string;
  handle: string;
  global_name: string;
  nickname: string;
  avatar: string;
  roles: Role[];
  joined_at: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "morae.me",
    description: "온라인 끝말잇기 게임 '끄투' 전적 검색 사이트",
    link: "https://morae.me",
    image: "/moraeme.png",
  },
  {
    id: 2,
    title: "이하봇",
    description: "이터널 리턴 전적 검색 디스코드 봇",
    link: "https://discord.com/discovery/applications/769163955137675275",
    image: "/ihahbot.png",
  },
  {
    id: 3,
    title: "메버에 진심인 봇",
    description: "1:1 덱 빌딩 결투 보드게임 '메타버서스 시리즈' 정보 검색 디스코드 봇",
    link: "https://discord.com/discovery/applications/1421287090015965224",
    image: "/metaversus.webp",
  }
];


const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  return members;
};

const LINKS: { icon: IconType; href: string }[] = [
  { icon: FaDiscord, href: "https://discord.gg/cf3D2HCzEh" },
  { icon: FaGithub, href: "https://github.com/team-lument" },
];

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

const ProjectItem = ({ project }: { project: Project }) => (
  <Box
    p={5}
    borderWidth="1px"
    borderColor="border.muted"
    borderRadius="lg"
    _hover={{ borderColor: "border", bg: "bg.muted" }}
    transition="all 0.2s"
    cursor="pointer"
  >
    <HStack gap={4}>
      {project.image && <Image src={project.image} alt={project.title} width={50} height={50} className="rounded-full" />}
      <VStack align="start">
        <Text fontWeight="bold" fontSize={18} mb={-2} color="fg">
          {project.title}
        </Text>
        <Text color="fg.muted" fontSize="sm">
          {project.description}
        </Text>
      </VStack>
    </HStack>
  </Box>
);

const MemberItem = ({ member }: { member: Member }) => (
  <HStack
    p={4}
    borderWidth="1px"
    borderColor="border.muted"
    borderRadius="lg"
    gap={4}
    _hover={{ borderColor: "border", bg: "bg.muted" }}
    transition="all 0.2s"
    cursor="pointer"
  >
    <Avatar.Root size="md">
      <Avatar.Fallback name={member.nickname} />
      <Avatar.Image
        src={`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=1024`}
      />
    </Avatar.Root>
    <Box>
      <HStack gap={1} align="baseline">
        <Text fontWeight="bold" color="fg">
          {member.nickname ?? member.global_name ?? member.handle.slice(1)}
        </Text>
        <Text fontWeight="normal" fontSize="sm" color="fg.muted">
          {member.handle}
        </Text>
      </HStack>
      <HStack gap={1} mt={1} flexWrap="wrap">
        {[...member.roles].reverse().map((role) => (
          role.id != "1096708045964324924" &&
          <Badge key={role.id} variant="surface">
            <Box as="span" bg={role.color} boxSize={2} borderRadius="full" display="inline-block" />
            {role.name}
          </Badge>
        ))}
      </HStack>
    </Box>
  </HStack>
);

export default function Home() {
  const [view, setView] = useState<"project" | "member">("project");
  const members = useMembers();

  return (
    <Flex minH="100vh" align="center" justify="center" p={8}>
      <Flex direction="column" gap={10} width="100%" maxW="2xl">
        <HStack gap={4} justify="center">
          <Image src="/lument.png" alt="Lument" width={70} height={70} />
          <Text fontSize="3xl" fontWeight="bold" letterSpacing="tight">
            TEAM LUMENT
          </Text>
        </HStack>

        <Box>
          <AnimatePresence mode="wait" initial={false}>
            {view === "project" ? (
              <MotionBox
                key="project"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <VStack gap={4} align="stretch">
                  {PROJECTS.map((project) => (
                    project.link ? (
                      <Link
                        key={project.id}
                        href={project.link}
                        target="_blank"
                        style={{ textDecoration: "none", display: "block", width: "100%" }}
                      >
                        <ProjectItem project={project} />
                      </Link>
                    ) : (
                      <ProjectItem project={project} />
                    )
                  ))}
                </VStack>
              </MotionBox>
            ) : (
              <MotionGrid
                key="member"
                templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                gap={4}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {members.map((member) => (
                  <MemberItem key={member.id} member={member} />
                ))}
              </MotionGrid>
            )}
          </AnimatePresence>
        </Box>

        <HStack gap={8} justify="center">
          <Text
            fontSize="lg"
            fontWeight={view === "project" ? "bold" : "bold"}
            color={view === "project" ? "fg" : "fg.muted"}
            cursor="pointer"
            onClick={() => setView("project")}
            transition="all 0.2s"
            _hover={{ color: "fg" }}
            letterSpacing="widest"
          >
            PROJECTS
          </Text>
          <Text
            fontSize="lg"
            fontWeight={view === "member" ? "bold" : "bold"}
            color={view === "member" ? "fg" : "fg.muted"}
            cursor="pointer"
            onClick={() => setView("member")}
            transition="all 0.2s"
            _hover={{ color: "fg" }}
            letterSpacing="widest"
          >
            MEMBERS
          </Text>
        </HStack>
      </Flex>

      <HStack position="absolute" bottom={8} left={8} gap={4}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            color="fg.muted"
            _hover={{ color: "fg" }}
            transition="colors"
          >
            <link.icon size={24} />
          </Link>
        ))}
      </HStack>
    </Flex>
  );
}
