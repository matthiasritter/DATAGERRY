# DATAGERRY - OpenSource Enterprise CMDB
# Copyright (C) 2019 NETHINKS GmbH
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import json
import logging
from typing import List

from bson import json_util
from flask import abort, request, current_app
from datetime import datetime

from cmdb.interface.route_utils import make_response, insert_request_user, login_required, right_required
from cmdb.interface.blueprint import RootBlueprint
from cmdb.user_management import User
from cmdb.user_management.user_manager import UserManagerInsertError, UserManagerGetError, \
    UserManagerUpdateError, UserManagerDeleteError, UserManager
from cmdb.security.security import SecurityManager

try:
    from cmdb.utils.error import CMDBError
except ImportError:
    CMDBError = Exception

LOGGER = logging.getLogger(__name__)
user_blueprint = RootBlueprint('user_rest', __name__, url_prefix='/user')

with current_app.app_context():
    user_manager: UserManager = current_app.user_manager
    security_manager: SecurityManager = current_app.security_manager


@user_blueprint.route('/', methods=['GET'])
@login_required
@insert_request_user
@right_required('base.user-management.user.*')
def get_users(request_user: User):
    try:
        users: List[User] = user_manager.get_users()
    except CMDBError:
        return abort(404)
    if len(users) < 1:
        return make_response([], 204)
    return make_response(users)


@user_blueprint.route('/<int:public_id>/', methods=['GET'])
@user_blueprint.route('/<int:public_id>', methods=['GET'])
@login_required
@insert_request_user
@right_required('base.user-management.user.view', excepted={'public_id': 'public_id'})
def get_user(public_id, request_user: User):
    try:
        user: User = user_manager.get_user(public_id=public_id)
    except UserManagerGetError:
        return abort(404)
    return make_response(user)


@user_blueprint.route('/<string:user_name>/', methods=['GET'])
@user_blueprint.route('/<string:user_name>', methods=['GET'])
@login_required
@insert_request_user
@right_required('base.user-management.user.view')
def get_user_by_name(user_name: str, request_user: User):
    try:
        user: User = user_manager.get_user_by_name(user_name=user_name)
    except UserManagerGetError:
        return abort(404)

    return make_response(user)


@user_blueprint.route('/group/<int:public_id>/', methods=['GET'])
@user_blueprint.route('/group/<int:public_id>', methods=['GET'])
@insert_request_user
@right_required('base.user-management.user.view')
def get_users_by_group(public_id: int, request_user: User):
    user_list = user_manager.get_users_by(group_id=public_id)
    if len(user_list) < 1:
        return make_response(user_list, 204)
    return make_response(user_list)


@user_blueprint.route('/', methods=['POST'])
@login_required
@insert_request_user
@right_required('base.user-management.user.add')
def add_user(request_user: User):
    http_post_request_data = json.dumps(request.json)
    new_user_data = json.loads(http_post_request_data, object_hook=json_util.object_hook)

    try:
        user_manager.get_user_by_name(new_user_data['user_name'])
    except (UserManagerGetError, Exception):
        pass
    else:
        return abort(400, f'User with the username {new_user_data["user_name"]} already exists')

    new_user_data['public_id'] = user_manager.get_new_id(User.COLLECTION)
    new_user_data['group_id'] = int(new_user_data['group_id'])
    new_user_data['registration_time'] = datetime.utcnow()
    new_user_data['password'] = security_manager.generate_hmac(new_user_data['password'])
    try:
        new_user = User(**new_user_data)
    except (CMDBError, Exception) as err:
        return abort(400, err.message)
    try:
        insert_ack = user_manager.insert_user(new_user)
    except UserManagerInsertError as err:
        return abort(400, err.message)

    return make_response(insert_ack)


@user_blueprint.route('/<int:public_id>/', methods=['PUT'])
@user_blueprint.route('/<int:public_id>', methods=['PUT'])
@login_required
@insert_request_user
@right_required('base.user-management.user.edit')
def update_user(public_id: int, request_user: User):
    http_put_request_data = json.dumps(request.json)
    user_data = json.loads(http_put_request_data)

    # Check if user exists
    try:
        user_manager.get_user(public_id)
    except UserManagerGetError:
        return abort(404)
    try:
        insert_ack = user_manager.update_user(public_id, user_data)
    except UserManagerUpdateError as err:
        return abort(400, err.message)

    return make_response(insert_ack.acknowledged)


@user_blueprint.route('/<int:public_id>/', methods=['DELETE'])
@user_blueprint.route('/<int:public_id>', methods=['DELETE'])
@login_required
@insert_request_user
@right_required('base.user-management.user.delete')
def delete_user(public_id: int, request_user: User):
    if public_id == request_user.get_public_id():
        return abort(403, 'You cant delete yourself!')
    try:
        user_manager.get_user(public_id)
    except UserManagerGetError:
        return abort(404)
    try:
        ack = user_manager.delete_user(public_id=public_id)
    except UserManagerDeleteError:
        return abort(400)
    return make_response(ack)


"""COUNT ROUTES"""


@user_blueprint.route('/count/', methods=['GET'])
@login_required
@insert_request_user
@right_required('base.user-management.user.view')
def count_users(request_user: User):
    try:
        count = user_manager.count_user()
    except CMDBError:
        return abort(400)
    return make_response(count)


"""SPEACIAL ROUTES"""


@user_blueprint.route('/<int:public_id>/passwd', methods=['PUT'])
@login_required
@insert_request_user
@right_required('base.user-management.user.*', {'public_id': 'public_id'})
def change_user_password(public_id: int, request_user: User):
    try:
        user_manager.get_user(public_id=public_id)
    except UserManagerGetError as e:
        LOGGER.error(f'User was not found: {e}')
        return abort(404, f'User with Public ID: {public_id} not found!')
    password = security_manager.generate_hmac(request.json.get('password'))
    try:
        ack = user_manager.update_user(public_id, {'password': password}).acknowledged
    except UserManagerUpdateError as e:
        LOGGER.error(f'Error while setting a new password for user: {e}')
        return abort(500, 'Could not update user')
    return make_response(ack)
