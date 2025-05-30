'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { guestRegex } from '@/lib/constants';
import { getUserByEmail } from '@/app/(auth)/actions';

export const Greeting = () => {
  const { data: session } = useSession();
  const isGuest = guestRegex.test(session?.user?.email ?? '');
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      if (session?.user?.email) {
        const userData = await getUserByEmail(session.user.email);
        setDbUser(userData);
      }
    }
    fetchUser();
  }, [session?.user?.email]);

  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        {!isGuest && dbUser?.firstName ? `Hello, ${dbUser.firstName}!` : 'Hello there!'}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-zinc-500"
      >
        How can I help you today?
      </motion.div>
    </div>
  );
};
