"use client";

import { getActiveFeed } from "@/libs/steem/sds";
import { AsyncUtils } from "@/utils/async.utils";
import React, { useEffect } from "react";

function page() {
  let allPosts: Feed[] = [];
  let apps: { name: string; count?: number }[] = [];
  let appCounts = {};

  useEffect(() => {
    // getAllPosts();
  }, []);

  async function getAllPosts() {
    try {
      allPosts = [];
      for (let index = 0; index < 40; index++) {
        const posts = await getActiveFeed(
          "trending",
          "null",
          50,
          1000,
          1000 * (index || 1)
        );

        allPosts.push(...posts);
        await AsyncUtils.sleep(1);
        if (posts?.length < 1000) {
          break;
        }
      }
      if (allPosts.length) {
        countApps(allPosts);
      }
    } catch (error) {
    } finally {
      allPosts = [];
    }
  }

  function countApps(posts) {
    apps = [];
    appCounts = {};
    posts.forEach((element) => {
      const json_metadata = JSON.parse(element?.["json_metadata"] ?? `{}`);
      const app = json_metadata?.["app"];

      if (app) {
        if (appCounts[app]) {
          appCounts[app].count += 1;
        } else {
          appCounts[app] = { name: app, count: 1 };
        }
      }
    });

    apps = Object.values(appCounts);
  }
  return <div>App Usage</div>;
}

export default page;
