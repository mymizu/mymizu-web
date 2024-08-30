import { useEffect, useState } from "react";
import getSlug from "../utils/getSlug";

export const useRefillSpotSlug = () => {
  const [slug, setSlug] = useState();

  useEffect(() => {
    const REFILL_SPOT_ROUTE = "/refill/";
    setSlug(getSlug(REFILL_SPOT_ROUTE));
  }, [])

  return slug
}