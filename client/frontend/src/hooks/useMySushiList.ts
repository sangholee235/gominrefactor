import { useState, useEffect, useRef, useCallback } from 'react';
import { useTrail } from '@react-spring/web';
import { fetchMySushiList, deleteMySushi } from '../api/mySushiApi';
import type { MySushi } from '../types/mySushi';

export const useMySushiList = () => {
  const [sushiList, setSushiList] = useState<MySushi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSushiId, setSelectedSushiId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [cache, setCache] = useState<Map<string, {data: MySushi[], timestamp: number}>>(new Map());
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

  const fetchSushi = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    const cacheKey = `${searchTerm}-${page}`;
    const cached = cache.get(cacheKey);
    
    // 캐시가 유효하면 캐시 사용
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (isLoadMore) {
        setSushiList(prev => [...prev, ...cached.data]);
      } else {
        setSushiList(cached.data);
      }
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      const { sushi: list, hasMore: more } = await fetchMySushiList(searchTerm, page);
      
      // 캐시 업데이트
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, { data: list, timestamp: Date.now() });
        return newCache;
      });
      
      if (isLoadMore) {
        setSushiList(prev => [...prev, ...list]);
      } else {
        setSushiList(list);
        setCurrentPage(1);
      }
      
      setHasMore(more);
      setCurrentPage(page);
    } catch (err) {
      console.error("데이터 로딩 에러:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, cache]);

  // 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loadingMore || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      fetchSushi(currentPage + 1, true);
    }
  }, [currentPage, loadingMore, hasMore, fetchSushi]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSushi(1, false);
    }, 0); // 300ms로 단축
    return () => clearTimeout(timer);
  }, [searchTerm, fetchSushi]);

  // 수정 완료 이벤트 수신 시 캐시 초기화 후 재요청
  useEffect(() => {
    const onUpdated = () => {
      setCache(new Map());
      fetchSushi(1, false);
    };
    window.addEventListener('mySushiUpdated', onUpdated);
    return () => window.removeEventListener('mySushiUpdated', onUpdated);
  }, [fetchSushi]);

  const trail = useTrail(sushiList.length, {
    opacity: 1,
    transform: "translateY(0px)",
    from: { opacity: 0, transform: "translateY(50px)" },
    config: { tension: 250, friction: 25 },
    reset: false,
  });

  const handleScrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCardClick = (id: number) => {
    setSelectedSushiId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSushiId(null);
  };

  const reorderSushiList = (fromIndex: number, toIndex: number) => {
    setSushiList(prev => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }
      const next = prev.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };


  const handleDeleteSushi = async (sushiId: number) => {
    try {
      await deleteMySushi(sushiId);
      // 삭제 성공: 목록에서 해당 항목 제거
      setSushiList(prev => prev.filter(sushi => sushi.id !== sushiId));
    } catch (error) {
      console.error('스시 삭제 실패:', error);
      throw error; // 컴포넌트에서 에러 처리하도록 throw
    }
  };

  return {
    sushiList,
    loading,
    loadingMore,
    searchTerm,
    setSearchTerm,
    selectedSushiId,
    isModalOpen,
    scrollRef,
    trail,
    fetchSushi,
    handleScrollToTop,
    handleCardClick,
    closeModal,
    handleDeleteSushi,
    reorderSushiList,
  };
};
