import { useEffect } from 'react';
import { Tabs, rem } from '@mantine/core';
import { IconMessageChatbot, IconClipboardPlus, IconMoodEdit, IconShoppingBagEdit, IconInfoCircle, } from '@tabler/icons-react';


import InboxDashboardPage from '@/app/components/dashboard/inbox.page';
import FormsDashboardPage from '@/app/components/dashboard/form.page';
import NewsletterDashboardPage from '@/app/components/dashboard/newsletter.page';
import OrderDashboardPage from '@/app/components/dashboard/order.page';
import CRMAboutPage from '@/app/components/dashboard/crm.about.page';


const tabList = [
  { value: 'inbox', label: 'Inbox', icon: IconMessageChatbot },
  { value: 'forms', label: 'Forms', icon: IconClipboardPlus },
  { value: 'subscribers', label: 'Subscribers', icon: IconMoodEdit },
  { value: 'sales', label: 'Sales', icon: IconShoppingBagEdit },
  { value: 'about', label: 'About & FAQ', icon: IconInfoCircle },
];

const CRMDashboardPage = () => {
  // Get tab from hash or default to inbox
  const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  const initialTab = tabList.some(t => t.value === hash) ? hash : 'inbox';

  // Update hash in URL when tab changes
  const handleTabChange = (tab: string | null) => {
    if (typeof window !== 'undefined' && tab) {
      window.location.hash = tab;
    }
  };

  // On mount, scroll to top and set hash if missing
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.location.hash = initialTab;
    }
    window.scrollTo(0, 0);
  }, [initialTab]);

  return (
    <Tabs
      defaultValue={initialTab}
      onChange={handleTabChange}
      color="fuchsia"
      variant="pills"
      radius="md"
      className="max-w-5xl mx-auto mt-8 bg-gradient-to-br from-fuchsia-50 to-sky-50 border-4 border-fuchsia-200 rounded-2xl shadow-2xl p-2"
      keepMounted={false}
    >
      <Tabs.List grow className="mb-4">
        {tabList.map(tab => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            leftSection={<tab.icon size={22} style={{ marginRight: rem(4) }} />}
            className="font-bold text-fuchsia-700 text-lg px-6 py-3 rounded-xl hover:bg-fuchsia-100 transition-all"
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <Tabs.Panel value="inbox" pt="md"><InboxDashboardPage /></Tabs.Panel>
      <Tabs.Panel value="forms" pt="md"><FormsDashboardPage /></Tabs.Panel>
      <Tabs.Panel value="subscribers" pt="md"><NewsletterDashboardPage /></Tabs.Panel>
      <Tabs.Panel value="sales" pt="md"><OrderDashboardPage /></Tabs.Panel>
      <Tabs.Panel value="about" pt="md"><CRMAboutPage /></Tabs.Panel>
    </Tabs>
  );
};

export default CRMDashboardPage;
