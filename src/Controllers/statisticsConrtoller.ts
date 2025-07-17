import { Request, Response, NextFunction } from "express";
import statisticsService from "../Services/statisticsService";

class StatisticsController {
  public GetCommonSatisticsByName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { clientName } = req.params;

      const statData = await statisticsService.GetCommonSatisticsByName(
        clientName
      );

      res.status(200).json(statData);
    } catch (error) {
      next(error);
    }
  };
}

export default new StatisticsController();
