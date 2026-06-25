import { Link, usePage } from '@inertiajs/react';
import {
    FileText,
    Globe,
    Handshake,
    LayoutGrid,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role;
    const isAdmin = role === 'super_admin' || role === 'admin';
    const hasAssignedClients = (auth.user?.clients_count ?? 0) > 0;

    const mainNavItems: NavItem[] = [
        ...(isAdmin
            ? [
                  { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                  { title: 'Clients', href: '/clients', icon: Handshake },
              ]
            : []),
        ...(isAdmin || hasAssignedClients
            ? [
                  { title: 'Invoices', href: '/invoices', icon: FileText },
                  { title: 'Domain & Hosting Info', href: '/domains', icon: Globe },
              ]
            : []),
        ...(isAdmin ? [{ title: 'Users', href: '/users', icon: Users }] : []),
    ];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
