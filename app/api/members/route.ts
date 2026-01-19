import { NextResponse } from "next/server";

export async function GET() {
    const GUILD_ID = process.env.GUILD_ID;
    const TARGET_ROLE_ID = process.env.TARGET_ROLE_ID;
    const PRIORITY_ROLE_ID = process.env.PRIORITY_ROLE_ID;
    const TOKEN = process.env.DISCORD_BOT_TOKEN;

    if (!TOKEN || !GUILD_ID || !TARGET_ROLE_ID || !PRIORITY_ROLE_ID) {
        return NextResponse.json(
            { error: "Environment variables are not defined" },
            { status: 500 }
        );
    }

    try {
        const [membersRes, rolesRes] = await Promise.all([
            fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`, {
                headers: { Authorization: `Bot ${TOKEN}` },
                next: { revalidate: 3600 },
            }),
            fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/roles`, {
                headers: { Authorization: `Bot ${TOKEN}` },
                next: { revalidate: 3600 },
            }),
        ]);

        if (!membersRes.ok || !rolesRes.ok) {
            return NextResponse.json(
                { error: "Failed to fetch data from Discord" },
                { status: 500 }
            );
        }

        const members: any[] = await membersRes.json();
        const roles: any[] = await rolesRes.json();

        const roleMap = new Map(
            roles.map((role) => [
                role.id,
                {
                    id: role.id,
                    name: role.name,
                    color: role.color ? `#${role.color.toString(16).padStart(6, "0")}` : null,
                },
            ])
        );

        const filteredMembers = members.filter((member) =>
            member.roles.includes(TARGET_ROLE_ID)
        );

        filteredMembers.sort((a, b) => {
            const aHasPriority = a.roles.includes(PRIORITY_ROLE_ID);
            const bHasPriority = b.roles.includes(PRIORITY_ROLE_ID);

            if (aHasPriority && !bHasPriority) return -1;
            if (!aHasPriority && bHasPriority) return 1;

            const dateA = a.joined_at ? new Date(a.joined_at).getTime() : 0;
            const dateB = b.joined_at ? new Date(b.joined_at).getTime() : 0;
            return dateA - dateB;
        });

        const result = filteredMembers.map((member) => {
            const memberRoles = member.roles
                .map((roleId: string) => roleMap.get(roleId))
                .filter((role: any) => role && role.name !== "@everyone");

            return {
                id: member.user.id,
                handle: `@${member.user.username}`,
                global_name: member.user.global_name,
                nickname: member.nick,
                avatar: member.user.avatar,
                roles: memberRoles,
                joined_at: member.joined_at,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error", details: String(error) },
            { status: 500 }
        );
    }
}
