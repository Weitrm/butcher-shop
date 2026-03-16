import { useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  totalPages: number;
}

type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

const getPageItems = (currentPage: number, totalPages: number): PageItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    start = 2;
    end = 4;
  }

  if (currentPage >= totalPages - 2) {
    start = totalPages - 3;
    end = totalPages - 1;
  }

  if (start > 2) {
    items.push('start-ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push('end-ellipsis');
  }

  items.push(totalPages);
  return items;
};

export const CustomPagination = ({ totalPages }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryPage = searchParams.get('page') || '1';
  const parsedPage = isNaN(+queryPage) ? 1 : +queryPage;
  const currentPage =
    totalPages > 0 ? Math.min(Math.max(parsedPage, 1), totalPages) : 1;
  const pageItems = getPageItems(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', page.toString());

    setSearchParams(nextParams);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={totalPages === 0 || currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Anteriores
      </Button>

      <div className="flex items-center gap-2">
        {pageItems.map((item) => {
          if (typeof item !== 'number') {
            return (
              <span key={item} className="px-1 text-sm text-muted-foreground">
                ...
              </span>
            );
          }

          return (
            <Button
              key={item}
              variant={currentPage === item ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(item)}
            >
              {item}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={totalPages === 0 || currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Siguientes
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
