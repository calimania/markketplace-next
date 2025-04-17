/** Our CISION new server connects to the PR news WIRE -
 * It Allows us and our community to stay inspired and informed
 * PR News Wire is a press release distributor, generally considered the largest
 * CISION is the parent company
 *
 * This module has a page to render lists & results, and display individual articles
 */

import News from "@/app/utils/cision";
import { Title } from "@mantine/core";

const Chisme = async () => {

  const news = await News.get();

  console.log({_o: news?.data[0], news})
  return (
    <>
      {news?.data?.map((n) => {
         return (
          <>xx
          <Title order={2}>{n.title}</Title>
          </>
        )
      }) }
    </>
  )
};

export default Chisme;
