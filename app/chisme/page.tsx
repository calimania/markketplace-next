/** Our CISION new server connects to the PR news WIRE -
 * It Allows us and our community to stay inspired and informed
 * PR News Wire is a press release distributor, generally considered the largest
 * CISION is the parent company
 *
 * This module has a page to render lists & results, and display individual articles
 */

import News from "@/app/utils/cision";
import Releases from '@/app/components/chisme/releases.page';
import { strapiClient } from '@/markket/api';
import { Page, Store } from "@/markket";

const Chisme = async () => {

  const news = await News.get();

  const _store = await strapiClient.getStore();
  const store = _store.data?.[0] as Store;
  const _page = await strapiClient.getPage('chisme');
  const page = _page.data?.[0] as Page;

  return (
    <Releases news={news?.data || []} store={store} page={page} />
  )
};

export default Chisme;
