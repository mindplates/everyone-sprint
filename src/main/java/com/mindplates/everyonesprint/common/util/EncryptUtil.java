package com.mindplates.everyonesprint.common.util;

import com.mindplates.everyonesprint.common.exception.ServiceException;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Component
public class EncryptUtil {
    public String getEncrypt(String source, byte[] salt) {
        try {
            byte[] a = source.getBytes();
            byte[] bytes = new byte[a.length + salt.length];
            System.arraycopy(a, 0, bytes, 0, a.length);
            System.arraycopy(salt, 0, bytes, a.length, salt.length);

            return getMessageDigestString(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new ServiceException("BAD_REQUEST");
        }

    }

    @SuppressWarnings("StringBufferMayBeStringBuilder")
    private String getMessageDigestString(byte[] bytes) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(bytes);

        byte[] byteData = md.digest();

        StringBuffer sb = new StringBuffer();
        for (byte byteDatum : byteData) {
            sb.append(Integer.toString((byteDatum & 0xFF) + 256, 16).substring(1));
        }

        return sb.toString();
    }

    public String getHash(String source) throws NoSuchAlgorithmException {

        byte[] a = source.getBytes();
        byte[] bytes = new byte[a.length];
        System.arraycopy(a, 0, bytes, 0, a.length);

        return getMessageDigestString(bytes);
    }

    public byte[] getSaltByteArray() {
        // salt 생성
        java.util.Random random = new java.util.Random();
        byte[] saltBytes = new byte[8];
        random.nextBytes(saltBytes);

        return saltBytes;
    }

    public String getSaltString(byte[] saltBytes) {
        return new java.math.BigInteger(saltBytes).toString(16);
    }
}

