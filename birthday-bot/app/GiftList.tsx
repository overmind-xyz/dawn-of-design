
import {
  Card,
  CardContent
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import GridLoader from "react-spinners/GridLoader";
import LoadingOverlay from 'react-loading-overlay-ts';
import SentGiftList from "./SentGiftList";
import ReceivedGiftList from "./ReceivedGiftList";

/* 
  This component is responsible for rendering the list of gifts sent and received by the user.
*/
export default function GiftList(
  props: {
    isTxnInProgress: boolean;
    setTxn: (isTxnInProgress: boolean) => void;
  }
) {
  return (
    <LoadingOverlay
      active={props.isTxnInProgress}
      spinner={
        <GridLoader
          color="#94a3b8"
          margin={0}
          speedMultiplier={0.75}
        />
      }
    >
      <Card className="max-h-full w-fit p-2">
        <CardContent className="flex flex-col items-center justify-center gap-2">
          <SentGiftList isTxnInProgress={props.isTxnInProgress} setTxn={props.setTxn} />
          <Separator className="mt-2" />
          <ReceivedGiftList isTxnInProgress={props.isTxnInProgress} setTxn={props.setTxn} />
        </CardContent>
      </Card>
    </LoadingOverlay>
  ) 
}