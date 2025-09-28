"use client";
import {
  useQueryStates,
  parseAsInteger,
} from "nuqs";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

const TablePagination = ({ count = 0 }: { count?: number }) => {
  const [pagination, setPagination] = useQueryStates(
    {
      skip: parseAsInteger.withDefault(0),
      take: parseAsInteger.withDefault(10),
    },
    {
      history: "push",
    },
  );

  const onNext = () => {
    setPagination((prev) => {
      return { ...prev, skip: prev.skip + prev.take };
    });
  };

  const onPrev = () => {
    setPagination((prev) => ({ ...prev, skip: prev.skip - prev.take }));
  };
  return (
    <Pagination className="mt-1 flex justify-end">
      <PaginationContent>
        <PaginationItem>
          <Button
            size="sm"
            variant="ghost"
            className="text-sm"
            disabled={pagination.skip < 1}
            onClick={onPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
        </PaginationItem>
        <div className="text-muted-foreground text-sm">
          <p>{`${count ? Math.ceil(pagination.skip / pagination.take) + 1 : 0} of ${count ? Math.ceil(count / pagination.take) : 0}`}</p>
        </div>
        <PaginationItem>
          <Button
            size="sm"
            variant="ghost"
            className="text-sm"
            disabled={
              count
                ? pagination.skip + pagination.take > count
                : true
            }
            onClick={onNext}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination