package com.mindplates.everyonesprint.biz.user.service;

import com.mindplates.everyonesprint.biz.space.repository.SpaceUserRepository;
import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.repository.UserRepository;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.util.EncryptUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    final private UserRepository userRepository;
    final private EncryptUtil encryptUtil;
    final private SpaceUserRepository spaceUserRepository;

    public UserService(UserRepository userRepository,  SpaceUserRepository spaceUserRepository, EncryptUtil encryptUtil) {
        this.userRepository = userRepository;
        this.spaceUserRepository = spaceUserRepository;
        this.encryptUtil = encryptUtil;
    }

    public User selectUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User selectUserByLoginToken(String token) {
        return userRepository.findByLoginToken(token).orElse(null);
    }

    public User selectUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> selectUserList(String email, String alias) {
        return userRepository.findAllByUseYnTrueAndEmailLikeOrAliasLike(email, alias);
    }

    public User createUser(User user) {
        LocalDateTime now = LocalDateTime.now();
        user.setActivateYn(false);
        user.setUseYn(true);
        user.setCreationDate(now);
        user.setLastUpdateDate(now);
        user.setRoleCode(RoleCode.MEMBER);
        user.setActiveRoleCode(RoleCode.MEMBER);

        String plainText = user.getPassword();
        byte[] saltBytes = encryptUtil.getSaltByteArray();
        String salt = encryptUtil.getSaltString(saltBytes);
        user.setSalt(salt);
        String encryptedText = encryptUtil.getEncrypt(plainText, saltBytes);
        user.setPassword(encryptedText);

        String tokenString = UUID.randomUUID().toString().replaceAll("-", "");
        user.setActivationToken(tokenString);

        if (user.getAutoLogin() != null && user.getAutoLogin()) {
            String loginTokenUUID = UUID.randomUUID().toString().replaceAll("-", "");
            user.setLoginToken(loginTokenUUID);
        }

        userRepository.saveAndFlush(user);
        user.setLastUpdatedBy(user.getId());
        user.setCreatedBy(user.getId());
        return userRepository.save(user);
    }

    public User login(String email, String password, Boolean autoLogin) {
        User user = userRepository.findByEmail(email).filter(u -> {
            String salt = u.getSalt();
            byte[] saltBytes = new java.math.BigInteger(salt, 16).toByteArray();
            String encryptedText = encryptUtil.getEncrypt(password, saltBytes);
            return u.getPassword().equals(encryptedText);
        }).orElse(null);

        if (user != null) {
            user.setLastUpdatedBy(user.getId());
            user.setLastUpdateDate(LocalDateTime.now());
            user.setLoginToken(autoLogin ? UUID.randomUUID().toString().replaceAll("-", "") : null);
            user.setAutoLogin(autoLogin);
            userRepository.saveAndFlush(user);
        }

        return user;
    }

    public void updateUser(User user) {
        userRepository.save(user);
    }

    public void updateUserLanguage(Long userId, String language) {
        User user = selectUser(userId);
        user.setLanguage(language);
        userRepository.save(user);
    }

    public void updateUserCountry(Long userId, String country) {
        User user = selectUser(userId);
        user.setCountry(country);
        userRepository.save(user);
    }

    public Long selectAllUserCount() {
        return userRepository.countBy();
    }

    public Long selectAllUserCount(String spaceCode) {
        return spaceUserRepository.countBySpaceCode(spaceCode);
    }


}
