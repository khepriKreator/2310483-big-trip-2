import MainPresenter from './presenters/main-presenter.js';
import PointsModel from './api/models/points-model.js';

const containers = {
  filters: document.querySelector('.trip-controls__filters'),
  main: document.querySelector('.trip-events'),
};
const pointsModel = new PointsModel();
const presenter = new MainPresenter(
  {
    containers,
    pointsModel
  });
presenter.init();
