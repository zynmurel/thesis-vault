import { Rating, RoundedStar, type RatingChange } from "@smastrom/react-rating";
import React from "react";
// Declare it outside your component so it doesn't get re-created
const myStyles = {
  itemShapes: RoundedStar,
  activeFillColor: "#ffb700",
  inactiveFillColor: "#fbf1a9",
};

export function RatingRoundedStar({
  onChange,
  value,
  readOnly,
}: {
  onChange?: RatingChange | undefined;
  value: number;
  readOnly?: boolean;
}) {
  return (
    <Rating
      style={{ maxWidth: 100 }}
      value={value}
      onChange={onChange}
      itemStyles={myStyles}
      readOnly={!!readOnly}
    />
  );
}
