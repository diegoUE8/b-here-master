import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UIMode } from '../agora/agora.types';
import HttpService from '../http/http.service';
import { RoleType, User } from './user';

export class UserService {

	static setUser(user) {
		this.user$.next(user);
	}

	static me$() {
		return HttpService.get$('/api/user/me').pipe(
			map((user) => this.mapUser(user)),
			catchError(error => {
				// console.log('UserService.me$.error', error);
				if (error.status === 404 || error.statusCode === 404) {
					return of(null);
				} else {
					throw (error);
				}
			}),
			switchMap(user => {
				this.setUser(user);
				return this.user$;
			}),
		);
	}

	static login$(payload) {
		return HttpService.post$('/api/user/login', payload).pipe(
			map((user) => this.mapUser(user)),
			tap((user) => this.setUser(user)),
		);
	}

	static logout$() {
		return HttpService.get$('/api/user/logout').pipe(
			map((user) => this.mapUser(user)),
			tap((user) => this.setUser(null)),
		);
	}

	static guidedTour$(payload) {
		return HttpService.post$('/api/user/guided-tour', payload).pipe(
			map((user) => this.mapUser(user)),
			tap((user) => this.setUser(user)),
		);
	}

	static selfServiceTour$(payload) {
		return HttpService.post$('/api/user/self-service-tour', payload).pipe(
			map((user) => this.mapUser(user)),
			tap((user) => this.setUser(user)),
		);
	}

	static resolve$(payload, status) {
		if (status === 'login') {
			return this.login$(payload);
		}
		if (status === 'guided-tour') {
			return this.guidedTour$(payload);
		}
		if (status === 'self-service-tour') {
			return this.selfServiceTour$(payload);
		}
	}

	static log$(payload) {
		return HttpService.post$('/api/user/log', payload);
	}

	static temporaryUser$(roleType = RoleType.Embed) {
		return of({
			id: this.uuid(),
			type: roleType,
			username: roleType,
			firstName: 'Jhon',
			lastName: 'Appleseed',
		}).pipe(
			map((user) => this.mapUser(user)),
			switchMap(user => {
				// console.log('UserService.temporaryUser$', user);
				this.setUser(user);
				return this.user$;
			}),
		);
	}

	static uuid() {
		return new Date().getTime();
		// return parseInt(process.hrtime.bigint().toString());
	}

	/*
	static retrieve$(payload) {
		return HttpService.post$('/api/user/retrievepassword', payload).pipe(
			map((user) => this.mapUser(user)),
		);
	}

	static register$(payload) {
		return HttpService.post$('/api/user/register', payload).pipe(
			map((user) => this.mapUser(user)),
		);
	}

	static update(payload) {
		return HttpService.post$('/api/user/updateprofile', payload).pipe(
			map((user) => this.mapUser(user)),
		);
	}
	*/

	static mapUser(user) {
		return new User(user);
	}

	static getMode(role) {
		let mode;
		switch (role) {
			case RoleType.Publisher:
			case RoleType.Attendee:
			case RoleType.Streamer:
			case RoleType.Viewer:
			case RoleType.Publisher:
			case RoleType.Publisher:
				mode = UIMode.VirtualTour;
				break;
			case RoleType.SelfService:
				mode = UIMode.SelfServiceTour;
				break;
			case RoleType.SmartDevice:
				mode = UIMode.LiveMeeting;
				break;
			case RoleType.Embed:
				mode = UIMode.Embed;
				break;
			default:
				mode = UIMode.None;
		}
		// console.log('UserService.getMode', role, mode);
		return mode;
	}

}

UserService.user$ = new BehaviorSubject(null);
