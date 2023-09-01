'use client';

import { MemoryOutlined, SettingsOutlined, StreamOutlined } from '@mui/icons-material';
import { useSession } from '@supabase/auth-helpers-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Avatar } from '~/components/Avatar/Avatar';
import { FloatingTabBar } from '~/components/FloatingTabBar/FloatingTabBar';
import { PropertyPanel } from '~/components/PropertyPanel/PropertyPanel';
import { ProjectProvider, useProject } from '~/providers/ProjectProvider/ProjectProvider';
import { Size } from '~/types';

function ProjectHeader() {
    const session = useSession();
    const { project } = useProject();

    return (
        <header className="fixed flex flex-row items-center justify-between p-12 pb-0 w-full">
            <Link className="z-10" href="/">
                <Image src="/alma_outline.png" alt="logo" width={40} height={40} quality={100} />
            </Link>
            {project && (
                <div className="absolute w-full flex flex-col items-center mx-auto">
                    <h2 className="text-lg font-medium">{project.name}</h2>
                    <span className="text-sm mt-1 opacity-50">{project.private ? 'Private' : 'Public'}</span>
                </div>
            )}
            {session && (
                <div className="z-10">
                    <Link href="/profile">
                        <Avatar size={Size.SM} source={session.user.user_metadata.picture} />
                    </Link>
                </div>
            )}
        </header>
    );
}

export default function Settings() {
    const {
        query: { username, projectId }
    } = useRouter();

    return (
        <ProjectProvider projectId={projectId as string}>
            <div className="flex flex-row h-screen">
                <ProjectHeader />
                <aside className="fixed flex flex-col h-full items-center justify-start pl-12 z-10">
                    <div className="my-auto">
                        <FloatingTabBar
                            items={[
                                {
                                    name: 'Preview',
                                    path: `/${username}/${projectId}`,
                                    icon: <StreamOutlined />
                                },
                                {
                                    name: 'Edit',
                                    path: `/${username}/${projectId}/edit`,
                                    icon: <MemoryOutlined />
                                },
                                {
                                    name: 'Settings',
                                    path: `/${username}/${projectId}/settings`,
                                    icon: <SettingsOutlined />
                                }
                            ]}
                        />
                    </div>
                </aside>
                <PropertyPanel />
            </div>
        </ProjectProvider>
    );
}
