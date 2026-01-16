import { useNetworkStore } from "@/store/network.js";
import { storeToRefs } from "pinia";
import { watch } from "vue";
export default function (reConnectFunc = null){
  const { networkType } = storeToRefs(useNetworkStore());
  watch(() => networkType.value, (val, oldVal) => { 
    if(val && !oldVal && typeof reConnectFunc === 'function'){
      reConnectFunc();
    }
  });
  const emptyViewReload = (e) => {
    typeof e === 'function' && e(false);
    typeof reConnectFunc === 'function' && reConnectFunc();
  }
  return { networkType, emptyViewReload };
}