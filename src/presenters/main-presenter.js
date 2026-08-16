import EventListView from '../view/event-list-view/event-list-view.js';
import EmptyListView from '../view/event-list-view/empty-list-view.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view/sort-view.js';
import SortOptionView from '../view/sort-view/sort-option-view.js';
import { render } from '../framework/render.js';
import { FiltersOptions, SortOptions, DEFAULT_SORT_OPTION } from '../api/constants.js';
import PointPresenter from './point-presenter.js';
import dayjs from 'dayjs';

export default class MainPresenter {
  #pointsModel = null;
  #mainContainer = null;
  #filtersContainer = null;

  #eventListComponent = new EventListView();
  #emptyListComponent = new EmptyListView();
  #sortContainer = new SortView(SortOptions);

  #pointsPresenters = new Map();
  #choosenSortOption = DEFAULT_SORT_OPTION;

  constructor({containers, pointsModel}) {
    this.#mainContainer = containers.main;
    this.#filtersContainer = containers.filters;
    this.#pointsModel = pointsModel;
  }

  get points () {
    switch (this.#choosenSortOption) {
      case 'sort-day':
        return [...this.#pointsModel.points].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
      case 'sort-time':
        return [...this.#pointsModel.points].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(a.dateTo)) - dayjs(b.dateFrom).diff(dayjs(b.dateTo)));
      case 'sort-price':
        return [...this.#pointsModel.points].sort((a, b) => b.basePrice - a.basePrice);
    }

    return this.#pointsModel.points;
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offersData() {
    return this.#pointsModel.offersData;
  }

  init() {
    this.#renderFilters();
    this.#renderPointsBoard();
  }

  #renderFilters() {
    render(new FiltersView(FiltersOptions, this.points), this.#filtersContainer);
  }

  #renderPointsBoard() {
    render(this.#eventListComponent, this.#mainContainer);
    if(this.points.length === 0) {
      this.#renderEmptyList();
      return;
    }
    this.#renderSort();
    this.#renderPoints();
  }

  #renderSort() {
    render(this.#sortContainer, this.#eventListComponent.element);
    SortOptions.forEach((option) => {
      const sortOptionComponent = new SortOptionView(option);
      render(sortOptionComponent, this.#sortContainer.element);
      sortOptionComponent.setHandlerSort(this.#handleSortPoints);
    });
  }

  #renderEmptyList() {
    render(this.#emptyListComponent, this.#mainContainer);
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter(
      {
        container: this.#eventListComponent.element,
        point,
        destinations: this.destinations,
        offersData: this.offersData,
        onDataUpdate: this.#handlePointChange,
        onModeChange: this.#handleEditorMode
      }
    );
    pointPresenter.init();
    this.#pointsPresenters.set(point.id, pointPresenter);
  }

  #renderPoints() {
    this.points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #clearPoints() {
    this.#pointsPresenters.forEach((pointPresenter) => pointPresenter.destroy());
    this.#pointsPresenters.clear();
  }

  #handleSortPoints = (sortType) => {
    if (this.#choosenSortOption === sortType) {
      return;
    }

    this.#choosenSortOption = sortType;
    this.#clearPoints();
    this.#renderPoints();
  };

  #handleEditorMode = () => {
    this.#pointsPresenters.forEach((pointPresenter) => {
      pointPresenter.resetMode();
    });
  };

  #handlePointChange = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);

    const pointPresenter = this.#pointsPresenters.get(updatedPoint.id);

    if (pointPresenter) {
      pointPresenter.update(updatedPoint);
    }
  };
}
