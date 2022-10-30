import unittest, os, sys
from app import app, db
from app.models import UserModel

class UserModelCase(unittest.TestCase):
  def setUp(self):
    basedir = os.path.abspath(os.path.dirname(__file__))
    # create a test database at current directory
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'test.db')
    app.testing=True
    # virtual test environment
    self.client = app.test_client()

    db.create_all()

    s1 = UserModel(username='user', email='user@user.com')
    s1.encode_password('user')
    s2 = UserModel(username='coordinator', email='coordinator@coordinator.com', UnitCoordinator=True)
    s2.encode_password('coordinator')
    s3 = UserModel(username='admin', email = 'admin@admin.com', admin=True, UnitCoordinator=True)
    s3.encode_password('admin')

    db.session.add_all([s1, s2, s3])
    db.session.commit()

  def tearDown(self):
    db.session.remove()
    db.drop_all()

  def test_isUser(self):
    user = UserModel.query.filter_by(email='user@user.com').first()
    self.assertFalse(user.admin)
    self.assertFalse(user.UnitCoordinator)

  def test_isCoordinator(self):
    user = UserModel.query.filter_by(email='coordinator@coordinator.com').first()
    self.assertTrue(user.UnitCoordinator)
    self.assertFalse(user.admin)

  def test_isAdmin(self):
    user = UserModel.query.filter_by(email='admin@admin.com').first()
    self.assertTrue(user.admin)
    self.assertTrue(user.UnitCoordinator)

  def test_password_hashing(self):
    user1 = UserModel.query.filter_by(email='user@user.com').first()
    user2 = UserModel.query.filter_by(email='coordinator@coordinator.com').first()
    user3 = UserModel.query.filter_by(email='admin@admin.com').first()
    self.assertTrue(user1.decode_password('user'))
    self.assertFalse(user1.decode_password('fakepassword'))
    self.assertTrue(user2.decode_password('coordinator'))
    self.assertFalse(user2.decode_password('fakepassword'))
    self.assertTrue(user3.decode_password('admin'))
    self.assertFalse(user3.decode_password('fakepassword'))

  def test_isCommit(self):
    user = UserModel(username='test',email='test@test.com')
    user.encode_password('test')
    db.session.add(user)
    db.session.commit()
    user = UserModel.query.filter_by(email='test@test.com').first()
    self.assertIsNotNone(user)

  def test_upgrade_user(self):
    user = UserModel(username='upgrade', email='upgrade@upgrade.com')
    user.encode_password('upgrade')
    db.session.add(user)
    db.session.commit()
    self.assertFalse(user.admin)
    self.assertFalse(user.UnitCoordinator)

    user = UserModel.query.filter_by(email='upgrade@upgrade.com').first()
    user.UnitCoordinator = True
    db.session.commit()
    self.assertTrue(user.UnitCoordinator)
    self.assertFalse(user.admin)


if __name__=='__main__':
  unittest.main(verbosity=2)