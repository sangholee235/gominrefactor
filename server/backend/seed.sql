SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `notification`;
TRUNCATE TABLE `sushi_exposure`;
TRUNCATE TABLE `answer`;
TRUNCATE TABLE `share_token`;
TRUNCATE TABLE `sushi`;
TRUNCATE TABLE `user`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. User (기본 1~7번 생성)
INSERT INTO `user` (id, created_at, updated_at, provider, provider_id) VALUES 
(1, NOW(6), NOW(6), 'google', 'user1_id'),
(2, NOW(6), NOW(6), 'kakao', 'user2_id'),
(3, NOW(6), NOW(6), 'apple', 'user3_id'),
(4, NOW(6), NOW(6), 'google', 'user4_id'),
(5, NOW(6), NOW(6), 'kakao', 'user5_id'),
(6, NOW(6), NOW(6), 'apple', 'user6_id'),
(7, NOW(6), NOW(6), 'google', 'user7_id');


-- 3. Sushi (15개)
INSERT INTO `sushi` (id, created_at, updated_at, user_id, category_id, sushi_type_id, title, content, expire_time, max_answers, remaining_answers, is_closed) VALUES 
(1, NOW(6), NOW(6), 1, 1, 1, 'Next.js 15의 캐싱 전략 변화와 App Router 마이그레이션 고민', '기존 13, 14 버전에서 사용하던 fetch의 force-cache 옵션이 15버전부터 기본값이 변경되면서 캐싱 전략을 전면 수정해야 하는 상황입니다. 특히 클라이언트 사이드에서의 데이터 정합성을 유지하면서 서버 부하를 최소화할 수 있는 캐시 태그(cache tag) 활용 방안에 대해 실무 경험이 있으신 분들의 조언을 구합니다.', DATE_ADD(NOW(), INTERVAL 7 DAY), 10, 5, false),
(2, NOW(6), NOW(6), 2, 3, 3, 'PostgreSQL의 인덱스 블로트(Index Bloat) 현상과 해결 방안', '대량의 업데이트와 삭제가 빈번하게 발생하는 테이블에서 인덱스 크기가 실제 데이터보다 비대해지는 현상이 발생하고 있습니다. VACUUM FULL을 하기엔 서비스 중단이 우려되는데, pg_repack 같은 도구를 사용하여 무중단으로 인덱스를 재구성할 때 주의해야 할 락(Lock) 경합 이슈에 대해 알고 싶습니다.', DATE_ADD(NOW(), INTERVAL 5 DAY), 5, 2, false),
(3, NOW(6), NOW(6), 3, 1, 2, 'C# Entity Framework Core에서 복합키(Composite Key)와 다대다 관계 설계', 'Prisma에서 했던 것처럼 EF Core에서도 Fluent API를 사용해 복합키를 설정하고 있는데, 중간 테이블(Join Table)을 거치지 않고 직접 다대다 관계를 매핑할 때 발생하는 쉐도우 프로퍼티 이슈를 겪고 있습니다. 마이그레이션 시 수동으로 SQL을 수정하지 않고 깔끔하게 클래스만으로 해결할 수 있는 방법이 있을까요?', DATE_ADD(NOW(), INTERVAL 3 DAY), 8, 4, false),
(4, NOW(6), NOW(6), 4, 1, 1, '마이크로서비스 간의 트랜잭션 일관성을 위한 Saga 패턴 구현', '주문 서비스와 재고 서비스가 분리된 환경에서 분산 트랜잭션을 처리해야 합니다. 2PC(Two-Phase Commit)는 성능 저하가 심해 코레오그래피(Choreography) 기반의 사가 패턴을 도입하려 하는데, 보상 트랜잭션(Compensating Transaction)이 실패했을 경우의 최종적 일관성을 보장하기 위한 큐 설계 노하우가 궁금합니다.', DATE_ADD(NOW(), INTERVAL 10 DAY), 15, 12, false),
(5, NOW(6), NOW(6), 5, 2, 4, 'Docker 컨테이너 기반 배포 시 Nginx 프록시 버퍼 설정 최적화', 'Node.js 서버 앞단에 Nginx를 컨테이너로 띄워 사용 중인데, 대용량 JSON 응답이 올 때마다 "upstream sent too big header" 에러가 발생하며 간헐적으로 502 Bad Gateway가 뜹니다. proxy_buffer_size와 proxy_buffers를 어느 정도로 튜닝하는 것이 메모리 효율과 성능 사이의 베스트 지점일까요?', DATE_ADD(NOW(), INTERVAL 4 DAY), 7, 3, false),
(6, NOW(6), NOW(6), 6, 1, 1, 'React 19의 React.use() 훅과 서버 컴포넌트 데이터 페칭', 'React 19에 도입된 use() 훅을 사용하여 프라미스를 렌더링 도중에 해제하는 패턴이 기존의 useEffect 방식과 비교했을 때 렌더링 성능에 어떤 영향을 주는지 궁금합니다. 특히 Suspense와의 연동 과정에서 나타나는 레이턴시 최적화 방안이 있을까요?', DATE_ADD(NOW(), INTERVAL 2 DAY), 10, 9, false),
(7, NOW(6), NOW(6), 7, 3, 2, 'Redis를 활용한 분산 락 구현 시 Redlock 알고리즘의 한계', '동시성 제어를 위해 Redisson 기반의 Redlock을 사용하고 있습니다. 클러스터 환경에서 네트워크 파티션이 발생했을 때 락의 안정성을 어떻게 보장하시나요? 펜싱 토큰(Fencing Token)을 활용한 정합성 보장 사례가 있는지 궁금합니다.', DATE_ADD(NOW(), INTERVAL 6 DAY), 5, 4, false),
(8, NOW(6), NOW(6), 1, 1, 3, 'TypeScript 5.x에서의 Const Type Parameters 활용 사례', '제네릭 인자의 추론을 리터럴 타입으로 강제하기 위해 const 수식어를 자주 사용합니다. 하지만 라이브러리 설계 시 복잡한 매핑 타입과 결합했을 때 컴파일 속도 저하 현상이 발생하는데, 이를 우회할 수 있는 설계 패턴이 있을까요?', DATE_ADD(NOW(), INTERVAL 5 DAY), 8, 8, false),
(9, NOW(6), NOW(6), 2, 2, 1, '쿠버네티스 Ingress-Nginx 컨트롤러의 어노테이션 기반 튜닝', '특정 API 엔드포인트에 대해서만 타임아웃을 길게 가져가야 합니다. ingress 레벨에서 설정하는 proxy-connect-timeout과 서버 전역 설정의 우선순위 관계, 그리고 대량의 커넥션 처리 시 워커 프로세스 튜닝 경험을 공유 부탁드립니다.', DATE_ADD(NOW(), INTERVAL 3 DAY), 12, 10, false),
(10, NOW(6), NOW(6), 3, 3, 2, 'MySQL 8.0의 Invisible Index를 활용한 쿼리 최적화 전략', '불필요한 인덱스를 삭제하기 전 안전하게 성능 변화를 모니터링하기 위해 인덱스를 보이지 않게 설정하려 합니다. 인덱스 생성 시부터 Invisible 상태로 만드는 것과 기존 인덱스를 전환하는 것 중 운영 환경에서 더 안전한 방법은 무엇일까요?', DATE_ADD(NOW(), INTERVAL 7 DAY), 6, 5, false);

-- 4. Answer (20개)
INSERT INTO `answer` (created_at, updated_at, user_id, sushi_id, content, is_liked) VALUES 
(NOW(6), NOW(6), 2, 1, 'Next.js 15에서는 fetch 캐싱이 기본적으로 no-store로 바뀌었죠. 이를 해결하려면 개별 fetch 레벨에서 cache: "force-cache"를 명시하거나, 레이아웃/페이지 레벨에서 export const dynamic = "force-static"을 사용해야 합니다.', true),
(NOW(6), NOW(6), 3, 1, '저는 차라리 TanStack Query를 서버 컴포넌트와 조합해서 사용하시는 걸 추천드립니다. 서버에서 Prefetching하고 클라이언트에서 Hydration하는 방식이 훨씬 제어하기 편합니다.', false),
(NOW(6), NOW(6), 1, 2, 'pg_repack은 인덱스 재구성 시 독점 락을 아주 짧게만 가져가기 때문에 무중단 처리에 적합합니다. 다만 작업 중 원본 테이블 크기만큼의 추가 디스크 공간이 필요하니 사전에 꼭 확인하세요.', true),
(NOW(6), NOW(6), 4, 2, '인덱스 블로트가 심하다면 필터링된 인덱스(Partial Index) 도입도 고려해보세요. 자주 조회되지 않는 과거 데이터 인덱스를 제거하면 비대화를 막을 수 있습니다.', false),
(NOW(6), NOW(6), 2, 3, 'EF Core 5.0부터는 명시적 중간 테이블 없이도 다대다 매핑이 가능합니다. UsingEntity()를 사용하여 쉐도우 프로퍼티를 실제 컬럼으로 매핑해주면 쿼리 작성이 훨씬 깔끔해집니다.', true),
(NOW(6), NOW(6), 5, 3, 'Prisma와 달리 EF Core는 엔티티 상태 추적 방식이라 복합키보다는 단일 대리키(ID)를 쓰고 유니크 제약 조건을 따로 거는 게 LINQ 성능 면에서 더 유리할 때가 많습니다.', false),
(NOW(6), NOW(6), 1, 4, '코레오그래피 방식은 서비스 간 의존성이 낮아 좋지만 추적이 어렵죠. Transactional Outbox 패턴을 함께 사용해서 이벤트 유실을 방지하는 것을 권장합니다.', true),
(NOW(6), NOW(6), 3, 4, '보상 트랜잭션 실패 시에는 수동 개입이 불가피합니다. 데드 레터 큐(DLQ)에 실패 이벤트를 쌓고 관리자에게 알림을 보낸 뒤 재시도하는 기능을 반드시 구축해두세요.', true),
(NOW(6), NOW(6), 2, 5, '헤더 사이즈 에러라면 proxy_buffer_size를 16k나 32k 정도로 늘려보세요. JWT 토큰이나 커스텀 헤더가 많아지면 기본값인 4k를 쉽게 초과하게 됩니다.', true),
(NOW(6), NOW(6), 1, 5, 'proxy_buffers 수치도 함께 조정하세요. 4 32k 정도로 설정하면 대용량 JSON 응답 시 발생하는 디스크 스왑 현상을 줄여 성능을 개선할 수 있습니다.', true),
(NOW(6), NOW(6), 1, 6, 'use() 훅은 조건부 호출이 불가능하므로 구조 설계 시 주의가 필요합니다. 하지만 렌더링 중 Promise를 직접 핸들링하므로 waterfall 현상을 막는 데 매우 효과적입니다.', true),
(NOW(6), NOW(6), 2, 7, 'Redlock은 시계 오차(Clock Drift)에 민감합니다. 분산 환경의 정합성이 정말 중요하다면 주키퍼나 에치디(etcd)를 이용한 락 구현도 고려해보시는 게 좋습니다.', true),
(NOW(6), NOW(6), 3, 8, '재귀적인 매핑 타입과 함께 쓸 때는 타입 깊이 제한에 걸릴 수 있습니다. 복잡한 추론보다는 인터페이스를 명확히 정의하고 as const로 캐스팅하는 게 컴파일 속도 면에서 낫습니다.', false),
(NOW(6), NOW(6), 4, 9, 'Ingress 어노테이션은 호스트나 경로별로 설정을 덮어쓰기 때문에 전역 설정보다 우선순위가 높습니다. 개별 API 설정에 매우 유용합니다.', true),
(NOW(6), NOW(6), 5, 10, 'MySQL 8.0 운영 환경이라면 기존 인덱스를 바로 삭제하기보다 Invisible로 2~3일간 유지하며 쿼리 로그를 모니터링하는 것이 가장 안전한 베스트 프랙티스입니다.', true);

-- 5. Notification (15개)
INSERT INTO `notification` (created_at, updated_at, user_id, sushi_id, notification_type, message, is_read, redirect_url) VALUES 
(NOW(6), NOW(6), 1, 1, 'NEW_ANSWER', '백엔드꿈나무님이 "Next.js 15 캐싱" 글에 답변을 남겼습니다.', false, '/sushi/1'),
(NOW(6), NOW(6), 1, 1, 'NEW_ANSWER', '데이터고수님이 새로운 솔루션을 제안했습니다.', false, '/sushi/1'),
(NOW(6), NOW(6), 2, 2, 'NEW_ANSWER', '연어처돌이님이 pg_repack 사용 팁을 답변했습니다.', true, '/sushi/2'),
(NOW(6), NOW(6), 3, 3, 'NEW_ANSWER', '백엔드꿈나무님이 EF Core Fluent API 가이드를 남겼습니다.', false, '/sushi/3'),
(NOW(6), NOW(6), 4, 4, 'NEW_ANSWER', '연어처돌이님이 Saga 패턴 보상 전략을 답변했습니다.', false, '/sushi/4'),
(NOW(6), NOW(6), 5, 5, 'NEW_ANSWER', '백엔드꿈나무님이 Nginx 버퍼 튜닝 수치를 제안했습니다.', true, '/sushi/5'),
(NOW(6), NOW(6), 6, 6, 'NEW_ANSWER', '연어처돌이님이 use() 훅 성능 분석을 답변했습니다.', false, '/sushi/6'),
(NOW(6), NOW(6), 7, 7, 'NEW_ANSWER', '백엔드꿈나무님이 분산 락 안정성 조언을 남겼습니다.', false, '/sushi/7'),
(NOW(6), NOW(6), 1, 8, 'NEW_ANSWER', '데이터고수님이 TS 타입 추론 팁을 답변했습니다.', true, '/sushi/8'),
(NOW(6), NOW(6), 2, 9, 'NEW_ANSWER', '리액트장인님이 Ingress 튜닝 경험을 공유했습니다.', false, '/sushi/9'),
(NOW(6), NOW(6), 3, 10, 'NEW_ANSWER', '데이터고수님이 MySQL 인덱스 관리 팁을 남겼습니다.', false, '/sushi/10'),
(NOW(6), NOW(6), 1, 1, 'LIKE', '데이터고수님이 당신의 질문을 좋아합니다.', true, '/sushi/1'),
(NOW(6), NOW(6), 2, 2, 'SYSTEM', '귀하의 고민글이 곧 만료될 예정입니다.', false, '/sushi/2'),
(NOW(6), NOW(6), 4, 4, 'NEW_ANSWER', '데이터고수님이 보상 트랜잭션 처리 전략을 남겼습니다.', false, '/sushi/4'),
(NOW(6), NOW(6), 3, 1, 'COMMENT', '풀스택워너비님이 답변에 추가 질문을 남겼습니다.', false, '/sushi/1');