import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CardsList from '../../components/cards-list/cards-list';
import CommentForm from '../../components/comment-form/comment-form';
import Header from '../../components/header/header';
import Map from '../../components/map/map';
import Gallery from '../../components/offer/gallery';
import HouseItems from '../../components/offer/house-items';
import ReviewsList from '../../components/review-list/reviews-list';
import { OfferType } from '../../types/types';
import { useAppSelector } from '../../hooks';
import { store } from '../../store';
import NotFound from '../404/not-found';
import { getOfferById } from '../../store/selectors';
import LoadingSpinner from '../../components/loading-spinner/loading-spinner';
import { AuthorizationStatus } from '../../const';
import { fetchNearbyOffersAction, fetchReviewsAction } from '../../store/offer/api-actions';
import { fetchOfferAction } from '../../store/offers/api-actions';

type RoomPageProps = {
  authorizationStatus: AuthorizationStatus;
};

function Room({authorizationStatus}: RoomPageProps): JSX.Element {
  const { id } = useParams();

  const offer = useAppSelector(getOfferById(Number(id)));
  const [selectedOffer, setSelectedOffer] = useState<OfferType | undefined>(
    offer
  );


  const selectedCity = useAppSelector((state) => state.clientReducer.currentCity);
  const reviews = useAppSelector((state) => state.offerReducer.commentsList);
  const nearbyOffers = useAppSelector((state) => state.offerReducer.nearbyOffersList);
  const isLoading = useAppSelector((state) => state.clientReducer.isLoading);
  const isAuth = useAppSelector((state) => state.userReducer.authorizationStatus);


  const fullOffers = [...nearbyOffers, offer];

  const onListItemEnter = (itemId: number) => {
    const currentPoint = Object.values(nearbyOffers).find((offerItem) => offerItem.id === itemId);

    setSelectedOffer(currentPoint);
  };

  const scrollToTop = ():void => {
    window.scroll(0, 0);
  };

  useEffect(() => {
    store.dispatch(fetchReviewsAction(Number(id)));
    store.dispatch(fetchNearbyOffersAction(Number(id)));
  }, [id]);

  useEffect(() => {
    if(!offer) {
      store.dispatch(fetchOfferAction(Number(id)));
    }
  }, [offer, id]);

  if (isLoading) {
    return <LoadingSpinner />;
  } else if(offer) {
    return (
      <>
        <Header authorizationStatus={authorizationStatus} />
        <main className="page__main page__main--property" key={offer.id}>
          <section className="property">
            <div className="property__gallery-container container">
              <div className="property__gallery">
                <Gallery pictures={offer.images} />
              </div>
            </div>
            <div className="property__container container" key={offer.id}>
              <div className="property__wrapper">
                {offer.isPremium ? (
                  <div className="property__mark">
                    <span>Premium</span>
                  </div>
                ) : (
                  ''
                )}
                <div className="property__name-wrapper">
                  <h1 className="property__name">{offer.title}</h1>
                </div>
                <div className="property__rating rating">
                  <div className="property__stars rating__stars">
                    <span style={{ width: `${
                      offer.rating * 20}%` }}
                    >
                    </span>
                    <span className="visually-hidden">Rating</span>
                  </div>
                  <span className="property__rating-value rating__value">
                    {offer.rating}
                  </span>
                </div>
                <ul className="property__features">
                  <li className="property__feature property__feature--entire">
                    {offer.type}
                  </li>
                  <li className="property__feature property__feature--bedrooms">
                    {offer.bedrooms} Bedrooms
                  </li>
                  <li className="property__feature property__feature--adults">
                    Max {offer.maxAdults} adults
                  </li>
                </ul>
                <div className="property__price">
                  <b className="property__price-value">
                    &euro;{offer.price}
                  </b>
                  <span className="property__price-text">&nbsp;night</span>
                </div>
                <div className="property__inside">
                  <h2 className="property__inside-title">What&apos;s inside</h2>
                  <ul className="property__inside-list">
                    <HouseItems houseItems={offer.goods} />
                  </ul>
                </div>
                <div className="property__host">
                  <h2 className="property__host-title">Meet the host</h2>
                  <div className="property__host-user user">
                    <div className={`property__avatar-wrapper ${offer.host.isPro ? 'property__avatar-wrapper--pro' : ''}  user__avatar-wrapper`}>
                      <img
                        className="property__avatar user__avatar"
                        src={offer.host.avatarUrl}
                        width="74"
                        height="74"
                        alt="Host avatar"
                      />
                    </div>
                    <span className="property__user-name">
                      {offer.host.name}
                    </span>
                    <span className="property__user-status">
                      {offer.host.isPro ? 'Pro' : ''}
                    </span>
                  </div>
                  <div className="property__description">
                    <p className="property__text">
                      {offer.description}
                    </p>
                  </div>
                </div>
                <section className="property__reviews reviews">
                  <ReviewsList reviews={reviews}/>
                  {isAuth === AuthorizationStatus.Auth ? (
                    <CommentForm offerId = {Number(id)} />
                  ) : null}

                </section>
              </div>
            </div>
            <section className="property__map map">
              <Map
                city={selectedCity}
                offers={fullOffers}
                selectedOffer={selectedOffer}
              />
            </section>
          </section>
          <div className="container">
            <section className="near-places places">
              <h2 className="near-places__title">
                Other places in the neighbourhood
              </h2>
              <div className="near-places__list places__list" onClick = {scrollToTop}>
                <CardsList offers={nearbyOffers} onListItemEnter={onListItemEnter} cardType = {'nearby'}/>
              </div>
            </section>
          </div>
        </main>
      </>
    );
  } else {
    return (
      <main className="page__main page__main--property">
        <section className="property">
          <NotFound />
        </section>
      </main>
    );
  }
}

export default Room;
