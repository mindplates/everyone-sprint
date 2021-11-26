package com.mindplates.everyonesprint.biz.user.service;

import com.mindplates.everyonesprint.biz.user.entity.User;
import com.mindplates.everyonesprint.biz.user.repository.UserRepository;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.util.EncryptUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EncryptUtil encryptUtil;

    public User selectUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User selectUser(Long id) {
        return userRepository.findById(id).orElse(null);
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


}
