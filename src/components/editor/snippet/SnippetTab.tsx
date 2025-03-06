import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";
import { MdSearch } from "react-icons/md";
import useSWR from "swr";
import AddSnippet from "./AddSnippet";
import EmptyList from "../../EmptyList";
import LoadingCard from "@/components/LoadingCard";
import SnippetItem from "./SnippetItem";
import ErrorCard from "@/components/ErrorCard";

interface Props {
  handleOnSelect?: (snippet: Snippet) => void;
}
function SnippetTab(props: Props) {
  const { data: session } = useSession();
  const [filterValue, setFilterValue] = useState("");
  const [isNew, setIsNew] = useState<{ isOpen: boolean; snippet?: Snippet }>({
    isOpen: false,
  });

  const { data, isLoading, error } = useSWR(
    session?.user?.name ? `/api/snippet/snippets` : null, // Ensure a valid key
    async (api: string): Promise<Snippet[]> => {
      try {
        const response = await fetch(api);
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching snippets:", error);
        return [];
      }
    }
  );

  const [allRows, setAllRows] = useState<Snippet[]>([]);

  useEffect(() => {
    if (data) {
      setAllRows(data);
    }
  }, [data]);

  const hasSeacrchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredSnippets: Snippet[] = [];
    filteredSnippets = [...allRows];

    if (hasSeacrchFilter)
      filteredSnippets = filteredSnippets.filter((snippet) =>
        snippet.title.toLowerCase().includes(filterValue.toLowerCase().trim())
      );

    return filteredSnippets;
  }, [allRows, filterValue]);

  return (
    <div className=" flex flex-col gap-4">
      {!isNew.isOpen ? (
        <>
          <div className=" flex flex-row items-center justify-between gap-4">
            <Input
              radius="full"
              classNames={{
                inputWrapper:
                  "text-default-500 bg-default-400/20 dark:bg-default-500/20",
              }}
              placeholder="Search by title..."
              size="md"
              value={filterValue}
              onValueChange={setFilterValue}
              startContent={<MdSearch size={20} />}
              type="search"
            />
            <Button
              onPress={() => {
                setIsNew({ isOpen: true });
              }}
              variant="flat"
              color="success"
            >
              Add
            </Button>
          </div>

          {isLoading ? (
            <LoadingCard />
          ) : error ? (
            <ErrorCard message={error} />
          ) : filteredItems?.length <= 0 ? (
            <EmptyList />
          ) : (
            filteredItems?.map((snippet) => {
              return (
                <SnippetItem
                  key={snippet.id}
                  {...props}
                  snippet={snippet}
                  handleEdit={(snippet) =>
                    setIsNew({ isOpen: true, snippet: snippet })
                  }
                />
              );
            })
          )}
        </>
      ) : (
        <>
          <AddSnippet
            oldSnippet={isNew.snippet}
            onClose={() => {
              setIsNew({ isOpen: !isNew.isOpen });
            }}
          />
        </>
      )}
    </div>
  );
}

export default SnippetTab;
