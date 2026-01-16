// [z-paging]useZPaging hooks

import { onPageScroll, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';

function useZPaging(paging) {
	const cPaging = !!paging ? paging.value || paging : null;
	onPullDownRefresh(() => {
		if (!cPaging || !cPaging.value) return;
		cPaging.value.reload().catch(() => { });
	})

	onPageScroll(e => {
		if (!cPaging || !cPaging.value) return;
		cPaging.value.updatePageScrollTop(e.scrollTop);
		e.scrollTop < 10 && cPaging.value.doChatRecordLoadMore();
	})

	onReachBottom(() => {
		if (!cPaging || !cPaging.value) return;
		cPaging.value.pageReachBottom();
	})
	const reload = (immediate = true, timeout = 100, showRefresh = true) => {
		if (!cPaging) return;
		if (immediate && cPaging.value) {
			cPaging.value.reload(showRefresh)
		} else {
			setTimeout(() => {
				reload(true, timeout);
			}, timeout);
		}
	}
	return { reload }
}

export default useZPaging