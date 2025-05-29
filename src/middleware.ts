import { validateCommunity } from "@/libs/utils/helper";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  validBasicCats,
  validCats,
  validProfileTabs,
} from "@/libs/constants/AppConstants";

// Define valid categories

// Define username URL regex
const usernameURLRegex = /@([^/]+)/;

export function middleware(request: NextRequest) {
  // Set pathname header
  request.headers.set("pathname", request.nextUrl.pathname);

  // Split the pathname into parts
  const splitted_path = request.nextUrl.pathname.split("/");

  // remove the first empty element
  splitted_path.shift();
  let [first_param, second_param, third_param] = splitted_path;

  first_param = first_param?.toLowerCase();
  second_param = second_param?.toLowerCase();

  if (splitted_path.length === 1 && first_param === "policy") {
    return NextResponse.rewrite(new URL(`/policy`, request.nextUrl), {
      headers: request.headers,
    });
  }

  if (splitted_path.length === 1 && first_param === "witnesses") {
    return NextResponse.rewrite(new URL(`/witnesses`, request.nextUrl), {
      headers: request.headers,
    });
  }

  if (splitted_path.length === 1 && first_param === "proposals") {
    return NextResponse.rewrite(new URL(`/proposals`, request.nextUrl), {
      headers: request.headers,
    });
  }
  if (splitted_path.length === 1 && first_param === "submit") {
    return NextResponse.rewrite(new URL(`/submit`, request.nextUrl), {
      headers: request.headers,
    });
  }
  if (splitted_path.length === 1 && first_param === "schedules") {
    return NextResponse.rewrite(new URL(`/schedules`, request.nextUrl), {
      headers: request.headers,
    });
  } else if (splitted_path.length === 1 && first_param === "about") {
    return NextResponse.rewrite(new URL(`/about`, request.nextUrl), {
      headers: request.headers,
    });
  } else if (
    splitted_path.length === 3 &&
    usernameURLRegex.test(second_param)
  ) {
    return NextResponse.rewrite(new URL("/post", request.nextUrl), {
      headers: request.headers,
    });
  }

  // check if the post without category
  else if (
    splitted_path.length === 2 &&
    usernameURLRegex.test(first_param) &&
    !validProfileTabs.includes(second_param)
  ) {
    return NextResponse.rewrite(new URL("/post", request.nextUrl), {
      headers: request.headers,
    });
  }
  // Check if the URL matches the pattern for a profile
  else if (request.nextUrl.pathname?.startsWith("/@")) {
    return NextResponse.rewrite(new URL(`/profile`, request.nextUrl), {
      headers: request.headers,
    });
  }
  // Check if the URL matches the pattern for a community
  else if (validateCommunity(second_param) && validCats.includes(first_param)) {
    return NextResponse.rewrite(new URL(`/community`, request.nextUrl), {
      headers: request.headers,
    });
  }
  // Check if the URL matches the pattern for a category
  else if (
    validCats
      .filter((item) => !["about", "tools"].includes(item))
      .includes(first_param)
  ) {
    if (validBasicCats.includes(first_param) && splitted_path.length === 1) {
      return NextResponse.rewrite(new URL("/", request.nextUrl), {
        headers: request.headers,
      });
    }
    return NextResponse.rewrite(new URL("/category", request.nextUrl), {
      headers: request.headers,
    });
  } else
    return NextResponse.rewrite(request.nextUrl, {
      headers: request.headers,
    });
}
