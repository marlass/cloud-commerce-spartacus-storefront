import { HttpClientModule } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CheckoutDetails, ConverterService } from '@spartacus/core';
import { ORDER_NORMALIZER } from '../../../checkout/connectors/checkout/converters';
import { Order } from '../../../model/order.model';
import { OccConfig } from '../../config/occ-config';
import { OccCheckoutAdapter } from './occ-checkout.adapter';

const userId = '123';
const cartId = '456';

const orderData: Order = {
  site: 'electronics',
  calculated: true,
  code: '00001004',
};

const usersEndpoint = '/users';
const orderEndpoint = '/orders';

const MockOccModuleConfig: OccConfig = {
  backend: {
    occ: {
      baseUrl: '',
      prefix: '',
    },
  },

  context: {
    baseSite: [''],
  },
};

const checkoutData: CheckoutDetails = {
  deliveryAddress: {
    firstName: 'Janusz',
  },
};
const CHECKOUT_PARAMS = 'deliveryAddress(FULL),deliveryMode,paymentInfo(FULL)';
const cartsEndpoint = 'carts';

describe('OccCheckoutAdapter', () => {
  let service: OccCheckoutAdapter;
  let httpMock: HttpTestingController;
  let converter: ConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [
        OccCheckoutAdapter,
        { provide: OccConfig, useValue: MockOccModuleConfig },
      ],
    });
    service = TestBed.inject(OccCheckoutAdapter);
    httpMock = TestBed.inject(HttpTestingController);
    converter = TestBed.inject(ConverterService);

    spyOn(converter, 'pipeable').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('place order', () => {
    it('should be able to place order for the cart', () => {
      service.placeOrder(userId, cartId).subscribe((result) => {
        expect(result).toEqual(orderData);
      });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'POST' &&
          req.url === usersEndpoint + `/${userId}` + orderEndpoint
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.params.get('cartId')).toEqual(cartId);
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(orderData);
    });

    it('should use converter', () => {
      service.placeOrder(userId, cartId).subscribe();
      httpMock
        .expectOne(
          (req) =>
            req.method === 'POST' &&
            req.url === usersEndpoint + `/${userId}` + orderEndpoint
        )
        .flush({});
      expect(converter.pipeable).toHaveBeenCalledWith(ORDER_NORMALIZER);
    });
  });

  describe('load checkout details', () => {
    it('should load checkout details data for given userId, cartId', () => {
      service.loadCheckoutDetails(userId, cartId).subscribe((result) => {
        expect(result).toEqual(checkoutData);
      });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'GET' &&
          req.url === `${usersEndpoint}/${userId}/${cartsEndpoint}/${cartId}`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.params.get('fields')).toEqual(CHECKOUT_PARAMS);
      mockReq.flush(checkoutData);
    });
  });

  describe('clear checkout delivery address', () => {
    it('should clear checkout delivery address for given userId, cartId', () => {
      service
        .clearCheckoutDeliveryAddress(userId, cartId)
        .subscribe((result) => {
          expect(result).toEqual(checkoutData);
        });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'DELETE' &&
          req.url ===
            `${usersEndpoint}/${userId}/${cartsEndpoint}/${cartId}/addresses/delivery`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(checkoutData);
    });
  });

  describe('clear checkout delivery mode', () => {
    it('should clear checkout delivery mode for given userId, cartId', () => {
      service.clearCheckoutDeliveryMode(userId, cartId).subscribe((result) => {
        expect(result).toEqual(checkoutData);
      });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'DELETE' &&
          req.url ===
            `${usersEndpoint}/${userId}/${cartsEndpoint}/${cartId}/deliverymode`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(checkoutData);
    });
  });
});
