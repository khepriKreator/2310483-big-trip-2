import BoardPresenter from './presenters/board-presenter.js';
import FiltersPresenter from './presenters/filters-presenter.js';
import PointsModel from './api/models/points-model.js';
import FiltersModel from './api/models/filters-model.js';

const containers = {
  filters: document.querySelector('.trip-controls__filters'),
  main: document.querySelector('.trip-events'),
};
const pointsModel = new PointsModel();
const filtersModel = new FiltersModel();

const boardPresenter = new BoardPresenter(
  {
    mainContainer: containers.main,
    pointsModel,
    filtersModel
  });
const filtersPresenter = new FiltersPresenter({
  container: containers.filters,
  pointsModel,
  filtersModel,
  onFilterChange: () => boardPresenter.handleFilterTypeChange()
});

filtersPresenter.init();
boardPresenter.init();
